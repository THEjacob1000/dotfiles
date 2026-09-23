#!/usr/bin/env python3
"""Find the hardening work clippy will not name for you.

The gate catches compiler and lint diagnostics. These seven heuristics locate
code worth reviewing against rust-guidelines; a hit is not proof of a defect.

    unwrap_expect   .unwrap() / .expect(...) outside recognised test code.
    numeric_cast    casts to numeric, character or boolean types.
    pub_field       public fields whose invariants may need encapsulation.
    primitive_id    repeated primitive identifier parameters across signatures.
    bool_param      boolean parameters whose call sites may be ambiguous.
    nested_option   Option<Option<T>> with potentially different absence states.
    stringly_enum   string-literal match arms that may represent a closed domain.

A tokenizer pass runs first and blanks comment bodies and literal contents in
place, so a `//` or a brace inside a string neither hides a hit nor swallows the
rest of the file. Everything after that is regex: macros stay invisible and
complex attributes can still produce false positives; this is not a Rust parser.
Unreadable source files fail the scan instead of silently disappearing.

Test code is excluded: unwrap is correct in a test, and a test module is not
public API. Files under tests/ and benches/ are skipped whole, as is any file
whose stem is `test`/`tests` or ends in `_test`/`_tests`, which is how a
`#[cfg(test)] #[path = "..."] mod` keeps its body in its own file. Inside a
source file, a `#[cfg(test)]` block is skipped by brace depth.

Counts are floors. A regex scan over Rust cannot see through macros, and a
category with zero hits means none were found, never that none exist. The file
list comes from `rg --files` when rg is installed, which honours .gitignore, and
from a directory walk otherwise; the run reports which one it used, because the
two see different trees.

Examples:
    python3 candidates.py                      # whole workspace
    python3 candidates.py crates/store --json  # one lane, machine output
    python3 candidates.py --category pub_field --limit 0
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path

CATEGORIES = (
    "unwrap_expect",
    "numeric_cast",
    "pub_field",
    "primitive_id",
    "bool_param",
    "nested_option",
    "stringly_enum",
)

SKIP_DIRS = {"target", ".git", ".jj", "node_modules", "tests", "benches"}
TEST_STEM = re.compile(r"^(?:tests?|.*_tests?)$")
NUMERIC = "u8|u16|u32|u64|u128|usize|i8|i16|i32|i64|i128|isize|f32|f64|char|bool"

UNWRAP = re.compile(r"\.(unwrap|expect)\s*\(")
CAST = re.compile(rf"\bas\s+(?:{NUMERIC})\b")
PUB_FIELD = re.compile(r"^\s*pub\s+(?:r#)?(?P<name>[a-z_][A-Za-z0-9_]*)\s*:\s*[^:=]")
NESTED_OPTION = re.compile(r"Option\s*<\s*Option\s*<")
STRINGLY = re.compile(r'^\s*(?:b?"(?:[^"\\]|\\.)*"\s*(?:\||=>))')
FN_SIGNATURE = re.compile(r"\bfn\s+(?P<fn>[A-Za-z_][A-Za-z0-9_]*)\s*(?:<[^>]*>)?\s*\(")
PARAM = re.compile(r"^(?:mut\s+)?(?P<name>[a-z_][A-Za-z0-9_]*)\s*:\s*(?P<type>.+)$")
ID_TYPE = re.compile(r"^&?(?:mut\s+)?(?:str|String|u8|u16|u32|u64|u128|usize|i32|i64)$")
BOOL_TYPE = re.compile(r"^(?:&(?:mut\s+)?)?bool$")
IDENT_CHAR = re.compile(r"[A-Za-z0-9_]")
RAW_OPEN = re.compile(r'b?r(#*)"')
CFG_TEST = re.compile(r"#\s*\[\s*cfg\s*\(\s*test\s*\)\s*\]")


@dataclass(frozen=True)
class Hit:
    """One candidate, already located."""

    category: str
    crate: str
    file: str
    line: int
    text: str

    def as_dict(self) -> dict[str, object]:
        return {
            "category": self.category,
            "crate": self.crate,
            "file": self.file,
            "line": self.line,
            "text": self.text,
        }


def char_literal_end(source: str, index: int) -> int | None:
    """Offset of the closing quote of a char literal at `index`, None for a lifetime."""
    if source[index + 1 : index + 2] == "\\":
        stop = source.find("'", index + 2)
        return stop if 0 <= stop <= index + 10 else None
    if source[index + 2 : index + 3] == "'":
        return index + 2
    return None


def mask_literals(source: str) -> str:
    """Blanks comment bodies and literal contents, keeping every line and column."""
    out = list(source)
    length = len(source)

    def blank(start: int, stop: int) -> None:
        for position in range(max(start, 0), min(stop, length)):
            if out[position] != "\n":
                out[position] = " "

    index = 0
    while index < length:
        if source.startswith("//", index):
            stop = source.find("\n", index)
            stop = length if stop < 0 else stop
            blank(index, stop)
            index = stop
        elif source.startswith("/*", index):
            depth, cursor = 0, index
            while cursor < length:
                if source.startswith("/*", cursor):
                    depth += 1
                    cursor += 2
                elif source.startswith("*/", cursor):
                    depth -= 1
                    cursor += 2
                    if depth == 0:
                        break
                else:
                    cursor += 1
            blank(index, cursor)
            index = cursor
            continue
        else:
            after_ident = index > 0 and bool(IDENT_CHAR.match(source[index - 1]))
            raw = None if after_ident else RAW_OPEN.match(source, index)
            if raw is not None:
                closing = '"' + raw.group(1)
                stop = source.find(closing, raw.end())
                stop = length if stop < 0 else stop
                blank(raw.end(), stop)
                index = length if stop == length else stop + len(closing)
            elif source[index] == '"':
                cursor = index + 1
                while cursor < length and source[cursor] != '"':
                    cursor += 2 if source[cursor] == "\\" else 1
                blank(index + 1, cursor)
                index = min(cursor + 1, length)
            elif source[index] == "'" and (stop := char_literal_end(source, index)) is not None:
                blank(index + 1, stop)
                index = stop + 1
            else:
                index += 1
    return "".join(out)


def crate_of(path: Path, root: Path) -> str:
    """Names the nearest ancestor of `path` that holds a Cargo.toml."""
    for parent in path.parents:
        if (parent / "Cargo.toml").is_file():
            try:
                return parent.relative_to(root).as_posix() or parent.name
            except ValueError:
                return parent.name
        if parent == root:
            break
    return "(workspace)"


def rust_files(root: Path) -> tuple[list[Path], str]:
    """Lists Rust sources, respecting rg's ignore rules when available."""
    if shutil.which("rg"):
        done = subprocess.run(
            ["rg", "--files", "--glob", "*.rs", str(root)],
            capture_output=True,
            text=True,
            check=False,
        )
        if done.returncode in {0, 1}:
            found = [Path(line) for line in done.stdout.splitlines() if line]
            return sorted(p for p in found if not skipped(p, root)), "rg"
    found = []
    for path in root.rglob("*.rs"):
        if not skipped(path, root):
            found.append(path)
    return sorted(found), "walk"


def skipped(path: Path, root: Path) -> bool:
    try:
        parts = path.relative_to(root).parts
    except ValueError:
        parts = path.parts
    if any(part in SKIP_DIRS for part in parts[:-1]):
        return True
    return bool(TEST_STEM.match(path.stem))


def test_lines(lines: list[str]) -> set[int]:
    """Line numbers inside a `#[cfg(test)]` item, by brace depth over masked lines."""
    inside: set[int] = set()
    armed = False
    depth = 0
    open_at: int | None = None
    for number, line in enumerate(lines, start=1):
        if open_at is None and CFG_TEST.search(line):
            armed = True
        if armed:
            inside.add(number)
            opens = line.count("{")
            closes = line.count("}")
            if open_at is None and not opens and ";" in line:
                armed = False
                continue
            if open_at is None and opens:
                open_at = number
                depth = 0
            if open_at is not None:
                inside.add(number)
                depth += opens - closes
                if depth <= 0:
                    armed = False
                    open_at = None
    return inside


Scan = tuple[list[Hit], dict[tuple[str, str], list[Hit]]]


def scan_file(path: Path, root: Path, wanted: set[str]) -> Scan:
    """Scans one file. Returns direct hits plus the primitive-id index."""
    try:
        source = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as error:
        raise OSError(f"cannot read {path}: {error}") from error
    lines = source.splitlines()
    code = mask_literals(source).splitlines()
    excluded = test_lines(code)
    crate = crate_of(path, root)
    name = path.relative_to(root).as_posix() if path.is_absolute() else path.as_posix()
    hits: list[Hit] = []
    ids: dict[tuple[str, str], list[Hit]] = defaultdict(list)

    def record(category: str, number: int, text: str) -> None:
        if category in wanted:
            hits.append(Hit(category, crate, name, number, text.strip()[:120]))

    for number, raw in enumerate(lines, start=1):
        if number in excluded:
            continue
        line = code[number - 1]
        stripped = line.strip()
        if not stripped or stripped.startswith(("//!", "///", "#!")):
            continue
        if UNWRAP.search(line):
            record("unwrap_expect", number, raw)
        if CAST.search(line):
            record("numeric_cast", number, raw)
        if PUB_FIELD.match(line) and "fn " not in line:
            record("pub_field", number, raw)
        if NESTED_OPTION.search(line):
            record("nested_option", number, raw)
        if STRINGLY.match(stripped) and "=>" in stripped:
            record("stringly_enum", number, raw)
        if FN_SIGNATURE.search(line):
            signature = signature_text(code, number - 1)
            for chunk in split_params(after_paren(signature)):
                parameter = PARAM.match(chunk)
                if parameter is None:
                    continue
                param_name = parameter.group("name")
                param_type = parameter.group("type").strip()
                if BOOL_TYPE.match(param_type) and param_name != "self":
                    record("bool_param", number, raw)
                elif ID_TYPE.match(param_type) and looks_like_id(param_name):
                    ids[(param_name, param_type)].append(
                        Hit("primitive_id", crate, name, number, stripped[:120])
                    )
    return hits, ids


def looks_like_id(name: str) -> bool:
    return bool(re.search(r"(^|_)(id|ids|key|uuid|token|name|path|slug|hash)$", name))


def after_paren(signature: str) -> str:
    return signature.split("(", 1)[1] if "(" in signature else signature


def split_params(text: str) -> list[str]:
    """Splits a parameter list on its top-level commas, stopping at the `)`."""
    closers = {">": "<", "}": "{", "]": "[", ")": "("}
    parts: list[str] = []
    current: list[str] = []
    depth: list[str] = []
    for char in text:
        if char in "<([{":
            depth.append(char)
        elif char == ")" and not depth:
            break
        elif char in closers and depth and depth[-1] == closers[char]:
            depth.pop()
        if char == "," and not depth:
            parts.append("".join(current).strip())
            current = []
        else:
            current.append(char)
    tail = "".join(current).strip()
    if tail:
        parts.append(tail)
    return [part for part in parts if part]


def signature_text(lines: list[str], index: int, span: int = 6) -> str:
    """Joins a signature that wraps across lines, up to the opening brace."""
    joined = []
    for line in lines[index : index + span]:
        joined.append(line)
        if ")" in line and ("{" in line or ";" in line or "->" in line):
            break
    return " ".join(part.strip() for part in joined)


def collect(root: Path, wanted: set[str]) -> tuple[list[Hit], str]:
    hits: list[Hit] = []
    index: dict[tuple[str, str], list[Hit]] = defaultdict(list)
    files, strategy = rust_files(root)
    for path in files:
        found, ids = scan_file(path, root, wanted)
        hits.extend(found)
        for key, value in ids.items():
            index[key].extend(value)
    if "primitive_id" in wanted:
        for occurrences in index.values():
            if len(occurrences) > 1:
                hits.extend(occurrences)
    return hits, strategy


def render(hits: list[Hit], limit: int, strategy: str) -> str:
    by_crate: dict[str, dict[str, list[Hit]]] = defaultdict(lambda: defaultdict(list))
    for hit in hits:
        by_crate[hit.crate][hit.category].append(hit)
    out: list[str] = []
    width = max([len(c) for c in by_crate] + [len("crate")]) if by_crate else len("crate")
    header = "crate".ljust(width) + "".join(f" {c[:9]:>10}" for c in CATEGORIES)
    out.append(header)
    out.append("-" * len(header))
    for crate in sorted(by_crate):
        counts = by_crate[crate]
        row = crate.ljust(width) + "".join(
            f" {len(counts.get(category, [])):>10}" for category in CATEGORIES
        )
        out.append(row)
    out.append("-" * len(header))
    out.append(
        "total".ljust(width)
        + "".join(
            f" {sum(1 for h in hits if h.category == category):>10}" for category in CATEGORIES
        )
    )
    for crate in sorted(by_crate):
        out.append("")
        out.append(f"## {crate}")
        for category in CATEGORIES:
            found = by_crate[crate].get(category, [])
            if not found:
                continue
            out.append(f"  {category} ({len(found)})")
            shown = found if limit <= 0 else found[:limit]
            for hit in shown:
                out.append(f"    {hit.file}:{hit.line}  {hit.text}")
            if len(found) > len(shown):
                out.append(f"    ... {len(found) - len(shown)} more")
    if not hits:
        out.append("")
        out.append("no candidates found (a floor, not a proof of absence)")
    out.append("")
    out.append(
        f"file list: {strategy} "
        + ("(.gitignore honoured)" if strategy == "rg" else "(every directory but SKIP_DIRS)")
    )
    return "\n".join(out)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="candidates.py",
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("root", nargs="?", default=".", type=Path, help="directory to scan")
    parser.add_argument(
        "--category",
        action="append",
        default=[],
        choices=list(CATEGORIES),
        help="restrict to one category; repeatable",
    )
    parser.add_argument("--json", action="store_true", help="machine-readable output")
    parser.add_argument("--limit", type=int, default=8, help="lines shown per category, 0 for all")
    args = parser.parse_args(argv)

    root = args.root.resolve()
    if not root.is_dir():
        print(f"candidates.py: not a directory: {root}", file=sys.stderr)
        return 2
    wanted = set(args.category) if args.category else set(CATEGORIES)
    try:
        hits, strategy = collect(root, wanted)
    except OSError as error:
        print(f"candidates.py: {error}", file=sys.stderr)
        return 2

    if args.json:
        counts: dict[str, dict[str, int]] = defaultdict(dict)
        for hit in hits:
            counts[hit.crate][hit.category] = counts[hit.crate].get(hit.category, 0) + 1
        print(
            json.dumps(
                {
                    "root": str(root),
                    "scan": strategy,
                    "categories": list(CATEGORIES),
                    "totals": {
                        category: sum(1 for h in hits if h.category == category)
                        for category in CATEGORIES
                    },
                    "crates": {crate: counts[crate] for crate in sorted(counts)},
                    "hits": [hit.as_dict() for hit in hits],
                },
                indent=2,
            )
        )
    else:
        print(render(hits, args.limit, strategy))
    return 0


if __name__ == "__main__":
    sys.exit(main())
