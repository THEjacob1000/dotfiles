#!/usr/bin/env python3
"""Find Rust code that can move into the compiler or disappear.

The gate catches compiler and lint diagnostics. These heuristics locate
subtraction and type-system leads that those diagnostics do not already cover:

    unwrap_expect       unwrap/expect sites, unless configured clippy covers them.
    numeric_cast        numeric, character or boolean casts, unless clippy covers them.
    pub_field           public fields whose invariants may need encapsulation.
    primitive_id        repeated primitive identifier parameters across signatures.
    bool_param          boolean parameters whose call sites may be ambiguous.
    stringly_enum       string-literal match arms that may represent a closed domain.
    unreferenced_pub    public items with no other production reference.
    single_impl_trait   traits with at most one implementation, including tests.
    forwarding_fn       functions whose only work is forwarding their parameters.
    runtime_invariant   assertions and panics that a type may make unrepresentable.

Newtypes, enums, private fields, TryFrom, and runtime_invariant leads can push
invariants into the type system. unreferenced_pub, single_impl_trait, and
forwarding_fn leads can delete code. Every hit is a lead, not proof of a safe
change, and all counts are floors.

A tokenizer pass blanks comments and literal contents in place. Test code is
excluded from hits and production references: files under tests/ and benches/,
test-stem files, #[cfg(test)] spans, and externally declared cfg(test) modules.
Test files are still counted in source-line totals and their trait impls prevent
single_impl_trait leads. Unreadable source fails the scan.

The workspace index starts at the topmost ancestor Cargo workspace, so a lane
scan sees production references and trait implementations in sibling crates.
The file list comes from `rg --files` when available and a directory walk
otherwise; the report identifies which strategy was used. `target`, `.git`,
`.jj`, and `node_modules` are always excluded.

Examples:
    python3 candidates.py
    python3 candidates.py crates/store --json
    python3 candidates.py --category pub_field --limit 0
    python3 candidates.py --baseline before.json
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
import tomllib
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path

CATEGORIES = (
    "unwrap_expect",
    "numeric_cast",
    "pub_field",
    "primitive_id",
    "bool_param",
    "stringly_enum",
    "unreferenced_pub",
    "single_impl_trait",
    "forwarding_fn",
    "runtime_invariant",
)

HARD_SKIP_DIRS = {"target", ".git", ".jj", "node_modules"}
TEST_DIRS = {"tests", "benches"}
TEST_STEM = re.compile(r"^(?:tests?|.*_tests?)$")
NUMERIC = "u8|u16|u32|u64|u128|usize|i8|i16|i32|i64|i128|isize|f32|f64|char|bool"

UNWRAP = re.compile(r"\.(unwrap|expect)\s*\(")
CAST = re.compile(rf"\bas\s+(?:{NUMERIC})\b")
PUB_FIELD = re.compile(r"^\s*pub\s+(?:r#)?(?P<name>[a-z_][A-Za-z0-9_]*)\s*:\s*[^:=]")
STRINGLY = re.compile(r'^\s*(?:b?"(?:[^"\\]|\\.)*"\s*(?:\||=>))')
FN_SIGNATURE = re.compile(r"\bfn\s+(?P<fn>[A-Za-z_][A-Za-z0-9_]*)\s*(?:<[^>]*>)?\s*\(")
PARAM = re.compile(r"^(?:mut\s+)?(?P<name>[a-z_][A-Za-z0-9_]*)\s*:\s*(?P<type>.+)$")
ID_TYPE = re.compile(r"^&?(?:mut\s+)?(?:str|String|u8|u16|u32|u64|u128|usize|i32|i64)$")
BOOL_TYPE = re.compile(r"^(?:&(?:mut\s+)?)?bool$")
PUB_ITEM = re.compile(
    r"^\s*pub(?:\s*\((?:crate|super|in\s+[^)]+)\))?\s+"
    r"(?:async\s+|unsafe\s+|const\s+|extern\s+\"[^\"]+\"\s+)*"
    r"(?P<kind>fn|struct|enum|trait|type|const|static)\s+(?:r#)?(?P<name>[A-Za-z_]\w*)"
)
TRAIT = re.compile(r"^\s*(?:pub(?:\s*\([^)]+\))?\s+)?trait\s+(?P<name>[A-Za-z_]\w*)")
TRAIT_IMPL = re.compile(
    r"\bimpl(?:\s*<[^{};]*>)?\s+(?:unsafe\s+)?!?"
    r"(?:[A-Za-z_]\w*::)*(?P<name>[A-Za-z_]\w*)\s*(?:<[^{};]*>)?\s+for\b"
)
RUNTIME_INVARIANT = re.compile(
    r"\b(?:debug_)?assert(?:_eq|_ne)?!\s*\(|\b(?:unreachable|panic)!\s*\("
)
IDENTIFIER = re.compile(r"\b[A-Za-z_]\w*\b")
IDENT_CHAR = re.compile(r"[A-Za-z0-9_]")
RAW_OPEN = re.compile(r'b?r(#*)"')
CFG_TEST = re.compile(r"#\s*\[\s*cfg\s*\(\s*test\s*\)\s*\]")
EXTERNAL_MOD = re.compile(
    r"(?ms)(?P<attrs>(?:\s*#\s*\[[^]]*\]\s*)+)"
    r"(?:pub(?:\s*\([^)]+\))?\s+)?mod\s+(?P<name>[A-Za-z_]\w*)\s*;"
)
PATH_ATTRIBUTE = re.compile(r'#\s*\[\s*path\s*=\s*"(?P<path>[^"]+)"\s*\]')
SOURCE_LINT_EXEMPTION = re.compile(
    r"#\s*!?\s*\[\s*(?:allow|expect)\s*\((?P<body>[^]]*)\)", re.DOTALL
)
ATTRIBUTE = re.compile(r"#\s*!?\s*\[\s*(?P<name>[A-Za-z_]\w*)")
BUILTIN_ATTRIBUTES = {
    "allow",
    "cfg",
    "cfg_attr",
    "cold",
    "deprecated",
    "derive",
    "doc",
    "expect",
    "inline",
    "must_use",
    "non_exhaustive",
    "repr",
    "track_caller",
}

CATEGORY_LINTS = {
    "unwrap_expect": ("unwrap_used", "expect_used"),
    "numeric_cast": ("as_conversions",),
}
ENFORCED_LEVELS = {"warn", "deny", "forbid"}


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


def hard_skipped(path: Path, root: Path) -> bool:
    """Whether a source belongs to a fully excluded directory."""
    try:
        parts = path.relative_to(root).parts
    except ValueError:
        parts = path.parts
    return any(part in HARD_SKIP_DIRS for part in parts[:-1])


def whole_test_file(path: Path, root: Path) -> bool:
    """Whether all code in a source file is test code."""
    try:
        parts = path.relative_to(root).parts
    except ValueError:
        parts = path.parts
    return any(part in TEST_DIRS for part in parts[:-1]) or bool(TEST_STEM.match(path.stem))


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
            return sorted(p for p in found if not hard_skipped(p, root)), "rg"
    return sorted(p for p in root.rglob("*.rs") if not hard_skipped(p, root)), "walk"


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


@dataclass
class Source:
    path: Path
    lines: list[str]
    code: list[str]
    excluded: set[int]
    whole_test: bool

    @property
    def masked(self) -> str:
        return "\n".join(self.code)

    @property
    def production(self) -> str:
        return "\n".join(
            line if number not in self.excluded and not self.whole_test else ""
            for number, line in enumerate(self.code, start=1)
        )


def read_source(path: Path, root: Path) -> Source:
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as error:
        raise OSError(f"cannot read {path}: {error}") from error
    lines = text.splitlines()
    code = mask_literals(text).splitlines()
    whole_test = whole_test_file(path, root)
    return Source(path, lines, code, set() if whole_test else test_lines(code), whole_test)


def workspace_root(root: Path) -> Path:
    """Finds the outermost ancestor declaring a Cargo workspace."""
    found = root
    for directory in (root, *root.parents):
        manifest = directory / "Cargo.toml"
        if not manifest.is_file():
            continue
        try:
            data = tomllib.loads(manifest.read_text(encoding="utf-8"))
        except (OSError, UnicodeDecodeError, tomllib.TOMLDecodeError) as error:
            raise OSError(f"cannot read {manifest}: {error}") from error
        if "workspace" in data:
            found = directory
    return found


def read_manifest(path: Path) -> dict[str, object]:
    try:
        return tomllib.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, tomllib.TOMLDecodeError) as error:
        raise OSError(f"cannot read {path}: {error}") from error


def lint_levels(entries: object) -> dict[str, str]:
    if not isinstance(entries, dict):
        return {}
    levels: dict[str, str] = {}
    for raw_name, value in entries.items():
        level = value.get("level") if isinstance(value, dict) else value
        if isinstance(level, str):
            levels[raw_name.replace("-", "_")] = level.lower()
    return levels


def crate_lints(crate: Path, workspace: Path) -> dict[str, str]:
    """Returns the clippy levels a crate manifest actually enables."""
    manifest = crate / "Cargo.toml"
    if not manifest.is_file():
        return {}
    data = read_manifest(manifest)
    lints = data.get("lints", {})
    if not isinstance(lints, dict):
        return {}
    levels: dict[str, str] = {}
    if lints.get("workspace") is True:
        workspace_data = read_manifest(workspace / "Cargo.toml")
        workspace_lints = workspace_data.get("workspace", {})
        if isinstance(workspace_lints, dict):
            inherited = workspace_lints.get("lints", {})
            if isinstance(inherited, dict):
                levels.update(lint_levels(inherited.get("clippy", {})))
    levels.update(lint_levels(lints.get("clippy", {})))
    return levels


def lint_coverage(levels: dict[str, str]) -> dict[str, list[str]]:
    return {
        category: [f"clippy::{lint}" for lint in lints]
        for category, lints in CATEGORY_LINTS.items()
        if all(levels.get(lint) in ENFORCED_LEVELS for lint in lints)
    }


def crate_directory(path: Path, workspace: Path) -> Path:
    for parent in path.parents:
        if (parent / "Cargo.toml").is_file():
            return parent
        if parent == workspace:
            break
    return workspace


def source_exemptions(source: Source) -> set[str]:
    exempted: set[str] = set()
    for match in SOURCE_LINT_EXEMPTION.finditer(source.masked):
        body = match.group("body").replace("-", "_")
        for category, lints in CATEGORY_LINTS.items():
            if any(re.search(rf"(?:clippy\s*::\s*)?{lint}\b", body) for lint in lints):
                exempted.add(category)
    return exempted


def clippy_coverage(
    sources: list[Source], root: Path, workspace: Path
) -> dict[str, dict[str, list[str]]]:
    covered: dict[str, dict[str, list[str]]] = {}
    for source in sources:
        crate = crate_of(source.path, root)
        if crate not in covered:
            levels = crate_lints(crate_directory(source.path, workspace), workspace)
            covered[crate] = lint_coverage(levels)
    return {crate: categories for crate, categories in covered.items() if categories}


def looks_like_id(name: str) -> bool:
    return bool(re.search(r"(^|_)(id|ids|key|uuid|token|name|path|slug|hash)$", name))


def after_paren(signature: str) -> str:
    return signature.split("(", 1)[1] if "(" in signature else signature


def split_params(text: str) -> list[str]:
    """Splits a parameter or argument list at top-level commas."""
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


def signature_text(lines: list[str], index: int, span: int = 12) -> str:
    """Joins a signature that wraps across lines, up to its body or semicolon."""
    joined = []
    for line in lines[index : index + span]:
        joined.append(line)
        if ")" in line and ("{" in line or ";" in line):
            break
    return " ".join(part.strip() for part in joined)


def matching_brace(text: str, opening: int) -> int | None:
    depth = 0
    for index in range(opening, len(text)):
        if text[index] == "{":
            depth += 1
        elif text[index] == "}":
            depth -= 1
            if depth == 0:
                return index
    return None


def closes_last(args: str) -> bool:
    """True when no `)` in `args` closes the call's own paren, so nothing chains after it."""
    depth = 0
    for char in args:
        depth += (char == "(") - (char == ")")
        if depth < 0:
            return False
    return depth == 0


def external_test_paths(sources: list[Source]) -> set[Path]:
    """Resolves files reached only through an external cfg(test) module."""
    by_path = {source.path.resolve(): source for source in sources}
    test_paths = {source.path.resolve() for source in sources if source.whole_test}
    changed = True
    while changed:
        changed = False
        for source in sources:
            parent_is_test = source.path.resolve() in test_paths
            for match in EXTERNAL_MOD.finditer(source.masked):
                if not parent_is_test and not CFG_TEST.search(match.group("attrs")):
                    continue
                original_attrs = "\n".join(source.lines)[match.start("attrs") : match.end("attrs")]
                path_attribute = PATH_ATTRIBUTE.search(original_attrs)
                if path_attribute:
                    candidates = [source.path.parent / path_attribute.group("path")]
                else:
                    name = match.group("name")
                    candidates = [
                        source.path.parent / f"{name}.rs",
                        source.path.parent / name / "mod.rs",
                    ]
                for candidate in candidates:
                    resolved = candidate.resolve()
                    if resolved in by_path and resolved not in test_paths:
                        test_paths.add(resolved)
                        changed = True
    return test_paths


def compile_time_assert_lines(source: Source) -> set[int]:
    pattern = re.compile(
        r"\b(?:const|static)\b[^;=]*=\s*(?:debug_)?assert(?:_eq|_ne)?!\s*\(",
        re.DOTALL,
    )
    return {
        source.production.count("\n", 0, match.end()) + 1
        for match in pattern.finditer(source.production)
    }


def has_nonbuiltin_attribute(source: Source, number: int) -> bool:
    attributes: list[str] = []
    depth = 0
    for line in reversed(source.code[: number - 1]):
        stripped = line.strip()
        if not stripped and not attributes:
            continue
        depth += stripped.count("]") - stripped.count("[")
        if depth > 0 or stripped.startswith("#"):
            attributes.append(stripped)
            continue
        break
    return any(
        match.group("name") not in BUILTIN_ATTRIBUTES
        for match in ATTRIBUTE.finditer("\n".join(reversed(attributes)))
    )


def forwarding_lines(source: Source) -> set[int]:
    """Finds bodies consisting only of a call with unchanged named parameters."""
    text = source.production
    found: set[int] = set()
    for match in FN_SIGNATURE.finditer(text):
        opening_paren = text.find("(", match.start())
        cursor = opening_paren + 1
        depth = 1
        while cursor < len(text) and depth:
            depth += (text[cursor] == "(") - (text[cursor] == ")")
            cursor += 1
        if depth:
            continue
        opening_brace = text.find("{", cursor)
        semicolon = text.find(";", cursor, opening_brace if opening_brace >= 0 else None)
        if opening_brace < 0 or semicolon >= 0:
            continue
        closing_brace = matching_brace(text, opening_brace)
        if closing_brace is None:
            continue
        parameters = []
        for chunk in split_params(text[opening_paren + 1 : cursor - 1] + ")"):
            parameter = PARAM.match(chunk.strip())
            if parameter and parameter.group("name") != "self":
                parameters.append(parameter.group("name"))
        if not parameters:
            continue
        body = text[opening_brace + 1 : closing_brace].strip()
        call = re.fullmatch(
            r"(?:[A-Za-z_]\w*(?:::[A-Za-z_]\w*)*(?:::\s*<[^()]*>)?"
            r"|(?:[A-Za-z_]\w*\.)+[A-Za-z_]\w*)"
            r"\s*\((?P<args>.*)\)\s*(?:\.await\s*)?(?:\?\s*)?;?",
            body,
            re.DOTALL,
        )
        if (
            call
            and closes_last(call.group("args"))
            and split_params(call.group("args") + ")") == parameters
        ):
            found.add(text.count("\n", 0, match.start()) + 1)
    return found


def scan_file(
    source: Source,
    root: Path,
    wanted: set[str],
    covered: dict[str, list[str]],
) -> Scan:
    """Scans one production source and returns direct hits plus primitive IDs."""
    path = source.path
    crate = crate_of(path, root)
    name = path.relative_to(root).as_posix()
    exemptions = source_exemptions(source)
    enabled = wanted - (set(covered) - exemptions)
    hits: list[Hit] = []
    ids: dict[tuple[str, str], list[Hit]] = defaultdict(list)
    forwarding = forwarding_lines(source) if "forwarding_fn" in enabled else set()
    compile_time_asserts = compile_time_assert_lines(source)

    def record(category: str, number: int, text: str) -> None:
        if category in enabled:
            hits.append(Hit(category, crate, name, number, text.strip()[:120]))

    for number, raw in enumerate(source.lines, start=1):
        if source.whole_test or number in source.excluded:
            continue
        line = source.code[number - 1]
        stripped = line.strip()
        if not stripped:
            continue
        if UNWRAP.search(line):
            record("unwrap_expect", number, raw)
        if CAST.search(line):
            record("numeric_cast", number, raw)
        if PUB_FIELD.match(line) and "fn " not in line:
            record("pub_field", number, raw)
        if STRINGLY.match(stripped) and "=>" in stripped:
            record("stringly_enum", number, raw)
        if number not in compile_time_asserts and RUNTIME_INVARIANT.search(line):
            record("runtime_invariant", number, raw)
        if number in forwarding:
            record("forwarding_fn", number, raw)
        if FN_SIGNATURE.search(line):
            signature = signature_text(source.code, number - 1)
            for chunk in split_params(after_paren(signature)):
                parameter = PARAM.match(chunk)
                if parameter is None:
                    continue
                param_name = parameter.group("name")
                param_type = parameter.group("type").strip()
                if BOOL_TYPE.match(param_type):
                    record("bool_param", number, raw)
                elif ID_TYPE.match(param_type) and looks_like_id(param_name):
                    ids[(param_name, param_type)].append(
                        Hit("primitive_id", crate, name, number, stripped[:120])
                    )
    return hits, ids


def collect(
    root: Path,
    wanted: set[str],
    explicit: bool,
) -> tuple[
    list[Hit],
    str,
    dict[str, int],
    dict[str, dict[str, list[str]]],
]:
    workspace = workspace_root(root)
    files, strategy = rust_files(workspace)
    sources = [read_source(path, workspace) for path in files]
    test_paths = external_test_paths(sources)
    for source in sources:
        if source.path.resolve() in test_paths:
            source.whole_test = True
            source.excluded.clear()
    scanned = [source for source in sources if source.path.is_relative_to(root)]
    covered = {} if explicit else clippy_coverage(scanned, root, workspace)
    lines = {"production": 0, "test": 0}
    for source in scanned:
        for number, line in enumerate(source.code, start=1):
            if line.strip():
                kind = "test" if source.whole_test or number in source.excluded else "production"
                lines[kind] += 1

    hits: list[Hit] = []
    primitive_ids: dict[tuple[str, str], list[Hit]] = defaultdict(list)
    for source in scanned:
        crate = crate_of(source.path, root)
        found, ids = scan_file(source, root, wanted, covered.get(crate, {}))
        hits.extend(found)
        for key, value in ids.items():
            primitive_ids[key].extend(value)
    if "primitive_id" in wanted:
        for occurrences in primitive_ids.values():
            if len(occurrences) > 1:
                hits.extend(occurrences)

    identifiers = Counter(
        identifier for source in sources for identifier in IDENTIFIER.findall(source.production)
    )
    impls = Counter(
        match.group("name") for source in sources for match in TRAIT_IMPL.finditer(source.masked)
    )
    for source in scanned:
        if source.whole_test:
            continue
        crate = crate_of(source.path, root)
        name = source.path.relative_to(root).as_posix()
        for number, raw in enumerate(source.lines, start=1):
            if number in source.excluded:
                continue
            line = source.code[number - 1]
            public = PUB_ITEM.match(line)
            if (
                "unreferenced_pub" in wanted
                and public
                and public.group("name") != "main"
                and identifiers[public.group("name")] == 1
                and not has_nonbuiltin_attribute(source, number)
            ):
                hits.append(Hit("unreferenced_pub", crate, name, number, raw.strip()[:120]))
            trait = TRAIT.match(line)
            if "single_impl_trait" in wanted and trait and impls[trait.group("name")] <= 1:
                hits.append(Hit("single_impl_trait", crate, name, number, raw.strip()[:120]))
    hits.sort(key=lambda hit: (hit.file, hit.line, CATEGORIES.index(hit.category)))
    return hits, strategy, lines, covered


def render(
    hits: list[Hit],
    limit: int,
    strategy: str,
    covered: dict[str, dict[str, list[str]]],
    lines: dict[str, int],
    baseline: dict[str, int] | None,
) -> str:
    by_crate: dict[str, dict[str, list[Hit]]] = defaultdict(lambda: defaultdict(list))
    for hit in hits:
        by_crate[hit.crate][hit.category].append(hit)
    width = max([len(c) for c in by_crate] + [len("crate")])
    header = "crate".ljust(width) + "".join(f" {c[:9]:>10}" for c in CATEGORIES)
    out = [header, "-" * len(header)]
    for crate in sorted(by_crate):
        counts = by_crate[crate]
        out.append(
            crate.ljust(width)
            + "".join(f" {len(counts.get(category, [])):>10}" for category in CATEGORIES)
        )
    out.extend(
        [
            "-" * len(header),
            "total".ljust(width)
            + "".join(
                f" {sum(hit.category == category for hit in hits):>10}" for category in CATEGORIES
            ),
        ]
    )
    for crate in sorted(by_crate):
        out.extend(("", f"## {crate}"))
        for category in CATEGORIES:
            found = by_crate[crate].get(category, [])
            if not found:
                continue
            out.append(f"  {category} ({len(found)})")
            shown = found if limit <= 0 else found[:limit]
            out.extend(f"    {hit.file}:{hit.line}  {hit.text}" for hit in shown)
            if len(found) > len(shown):
                out.append(f"    ... {len(found) - len(shown)} more")
    if not hits:
        out.extend(("", "no candidates found (a floor, not a proof of absence)"))
    out.append("")
    by_category: dict[str, dict[tuple[str, ...], list[str]]] = defaultdict(
        lambda: defaultdict(list)
    )
    for crate, categories in covered.items():
        for category, lints in categories.items():
            by_category[category][tuple(lints)].append(crate)
    for category, groups in by_category.items():
        for lints, crates in groups.items():
            out.append(
                f"skipped {category} in {', '.join(sorted(crates))}: covered by {', '.join(lints)}"
            )
    if baseline is None:
        out.append(f"lines: production {lines['production']}, test {lines['test']}")
    else:
        production_delta = lines["production"] - baseline["production"]
        test_delta = lines["test"] - baseline["test"]
        out.append(
            f"lines: production {baseline['production']} -> {lines['production']} "
            f"({production_delta:+d}), test {baseline['test']} -> {lines['test']} ({test_delta:+d})"
        )
    out.append(
        f"file list: {strategy} "
        + ("(.gitignore honoured)" if strategy == "rg" else "(every directory but exclusions)")
    )
    return "\n".join(out)


def load_baseline(path: Path, root: Path) -> dict[str, int]:
    try:
        report = json.loads(path.read_text(encoding="utf-8"))
        if Path(report["root"]).resolve() != root:
            raise ValueError("root does not match this scan")
        lines = report["lines"]
        if any(type(lines.get(kind)) is not int for kind in ("production", "test")):
            raise ValueError("line counts must be integers")
        return {"production": lines["production"], "test": lines["test"]}
    except (
        OSError,
        UnicodeDecodeError,
        json.JSONDecodeError,
        KeyError,
        TypeError,
        ValueError,
    ) as error:
        raise OSError(f"invalid baseline {path}: {error}") from error


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
        help="restrict to one category; repeatable and overrides clippy deduplication",
    )
    parser.add_argument("--baseline", type=Path, help="prior JSON report for line deltas")
    parser.add_argument("--json", action="store_true", help="machine-readable output")
    parser.add_argument("--limit", type=int, default=8, help="lines shown per category, 0 for all")
    args = parser.parse_args(argv)

    root = args.root.resolve()
    if not root.is_dir():
        print(f"candidates.py: not a directory: {root}", file=sys.stderr)
        return 2
    try:
        wanted = set(args.category) if args.category else set(CATEGORIES)
        hits, strategy, lines, covered = collect(root, wanted, bool(args.category))
        baseline = load_baseline(args.baseline, root) if args.baseline else None
    except OSError as error:
        print(f"candidates.py: {error}", file=sys.stderr)
        return 2

    counts: dict[str, dict[str, int]] = defaultdict(dict)
    for hit in hits:
        counts[hit.crate][hit.category] = counts[hit.crate].get(hit.category, 0) + 1
    delta = (
        {kind: lines[kind] - baseline[kind] for kind in ("production", "test")}
        if baseline
        else None
    )
    if args.json:
        report = {
            "root": str(root),
            "scan": strategy,
            "categories": list(CATEGORIES),
            "covered": covered,
            "totals": {
                category: sum(hit.category == category for hit in hits) for category in CATEGORIES
            },
            "crates": {crate: counts[crate] for crate in sorted(counts)},
            "lines": lines,
            "hits": [hit.as_dict() for hit in hits],
        }
        if delta is not None:
            report["delta"] = delta
        print(json.dumps(report, indent=2))
    else:
        print(render(hits, args.limit, strategy, covered, lines, baseline))
    return 0


if __name__ == "__main__":
    sys.exit(main())
