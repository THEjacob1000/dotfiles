#!/usr/bin/env python3
"""Run the whole Rust gate without stopping on the first failure.

Four steps run to completion regardless of each other's exit status: rustfmt,
clippy under the hardening lint set, rustdoc, and the test suite with
--no-fail-fast. Clippy and rustdoc are read from --message-format=json; rustfmt
and libtest are read from their human output, because libtest's JSON format is
still nightly-only.

Every diagnostic is attributed to a workspace crate by matching its primary
span against the longest workspace manifest directory from `cargo metadata`.
A message with no primary span is a summary line, not a defect, and is dropped;
the same diagnostic reported once per target is counted once.

The clippy wire is pedantic + nursery at warn level, never denied: a denied lint
in a leaf crate aborts that crate's build and leaves every dependent crate
unlinted, so the scan would silently stop at the first offender. Red is decided
by the parsed diagnostics and by cargo's exit status. Restriction lints
(unwrap_used, expect_used, as_conversions, panic) are deliberately absent: they
are correct inside tests and clippy cannot scope a command-line lint level to
non-test targets. candidates.py owns those, and excludes test code itself.

rustdoc runs with warnings denied, appended to `build.rustdocflags` from the
workspace `.cargo/config.toml` so a repository's own rustdoc lints survive. Only
that file is read, not a parent directory's config or CARGO_HOME.

A baseline must have reliable totals and package-qualified test identities from a
complete run. The comparison rejects newly ignored identities and baseline
failures that disappear. Passing tests and suites may retire; their identities
and the net passing count are reported for human review, alongside newly added
tests.

Exit status: 0 green, 1 red, 2 when cargo itself could not be run.

Examples:
    python3 gate.py                       # whole workspace, human table
    python3 gate.py -p my-crate --json    # one lane, machine output
    python3 gate.py --output baseline.json  # human summary and JSON, one run
    python3 gate.py --baseline baseline.json --output wave.json
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tomllib
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path

LINTS = ["-W", "clippy::pedantic", "-W", "clippy::nursery"]
STEPS = ("fmt", "clippy", "doc", "test")
WORKSPACE = "(workspace)"
SHOWN_PER_CODE = 6

FMT_DIFF = re.compile(r"^Diff in (?P<file>.+?)(?: at line |:)(?P<line>\d+):")
TEST_TOTAL = re.compile(
    r"^test result: (?:ok|FAILED)\. (\d+) passed; (\d+) failed; "
    r"(\d+) ignored; (\d+) measured; (\d+) filtered out(?:;.*)?$"
)
TOTAL_FIELDS = ("passed", "failed", "ignored", "measured", "filtered_out")
TEST_FAIL = re.compile(r"^\s{4}(?P<name>[\w:$<>{}#.\- ]+)$")
TEST_SUITE = re.compile(r"^\s+Running (?:unittests )?.+? \((?P<executable>.+)\)$")
DOC_SUITE = re.compile(r"^\s+Doc-tests (?P<target>\S+)\s*$")
TEST_CASE = re.compile(r"^test (?P<name>.+) \.\.\. (?P<status>ok|FAILED|ignored)(?:, .*)?$")


class CargoUnavailable(RuntimeError):
    """cargo is missing, or could not read the workspace manifest."""


@dataclass
class Diagnostic:
    """One rustfmt, clippy or rustdoc complaint, already attributed."""

    crate: str
    code: str
    file: str
    line: int
    message: str

    def where(self) -> str:
        return f"{self.file}:{self.line}"

    def as_dict(self) -> dict[str, object]:
        return {
            "crate": self.crate,
            "code": self.code,
            "file": self.file,
            "line": self.line,
            "message": self.message,
        }


@dataclass
class StepResult:
    """What one cargo invocation produced."""

    name: str
    ran: bool = False
    status: int = 0
    diagnostics: list[Diagnostic] = field(default_factory=list)
    failures: list[str] = field(default_factory=list)
    stderr_tail: str = ""
    totals: dict[str, int] | None = None
    tests: dict[str, list[str]] | None = None
    errors: list[str] = field(default_factory=list)

    @property
    def red(self) -> bool:
        return self.ran and (
            self.status != 0 or bool(self.diagnostics) or bool(self.failures) or bool(self.errors)
        )


@dataclass
class Workspace:
    """The workspace members, newest metadata read once."""

    root: Path
    crates: dict[str, Path]

    def attribute(self, file: str) -> str:
        path = Path(file)
        if not path.is_absolute():
            path = self.root / path
        best, depth = WORKSPACE, -1
        for name, directory in self.crates.items():
            try:
                path.relative_to(directory)
            except ValueError:
                continue
            length = len(directory.parts)
            if length > depth:
                best, depth = name, length
        return best


def read_workspace(manifest: Path | None) -> Workspace:
    """Reads workspace members with `cargo metadata --no-deps`."""
    command = ["cargo", "metadata", "--no-deps", "--format-version", "1"]
    if manifest is not None:
        command += ["--manifest-path", str(manifest)]
    if shutil.which("cargo") is None:
        raise CargoUnavailable("cargo is not on PATH")
    try:
        done = subprocess.run(command, capture_output=True, text=True, check=False)
    except OSError as error:
        raise CargoUnavailable(str(error)) from error
    if done.returncode != 0:
        raise CargoUnavailable(done.stderr.strip() or "cargo metadata failed")
    try:
        data = json.loads(done.stdout)
    except json.JSONDecodeError as error:
        raise CargoUnavailable(f"cargo metadata emitted no JSON: {error}") from error
    try:
        members = set(data["workspace_members"])
        crates = {
            package["name"]: Path(package["manifest_path"]).parent
            for package in data["packages"]
            if package["id"] in members
        }
        return Workspace(root=Path(data["workspace_root"]), crates=crates)
    except (KeyError, TypeError) as error:
        raise CargoUnavailable(f"invalid cargo metadata: {error}") from error


def run(
    command: list[str],
    cwd: Path,
    env: dict[str, str] | None = None,
    *,
    merge_stderr: bool = False,
) -> subprocess.CompletedProcess[str]:
    merged = dict(os.environ)
    if env:
        merged.update(env)
    try:
        return subprocess.run(
            command,
            cwd=cwd,
            env=merged,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT if merge_stderr else subprocess.PIPE,
            text=True,
            check=False,
        )
    except OSError as error:
        if merge_stderr:
            return subprocess.CompletedProcess(command, 127, str(error), "")
        return subprocess.CompletedProcess(command, 127, "", str(error))


def scope(package: str | None) -> list[str]:
    return ["-p", package] if package else ["--workspace"]


def jobs(count: int | None) -> list[str]:
    return ["-j", str(count)] if count else []


def parse_json_diagnostics(stdout: str, workspace: Workspace) -> list[Diagnostic]:
    """Pulls compiler-message events out of a --message-format=json stream."""
    found: list[Diagnostic] = []
    seen: set[tuple[str, int, str, str]] = set()
    for raw in stdout.splitlines():
        line = raw.strip()
        if not line.startswith("{"):
            continue
        try:
            event = json.loads(line)
        except json.JSONDecodeError:
            continue
        if event.get("reason") != "compiler-message":
            continue
        message = event.get("message") or {}
        if message.get("level") not in {"warning", "error"}:
            continue
        code = (message.get("code") or {}).get("code") or message.get("level") or "unknown"
        primary = next(
            (span for span in message.get("spans", []) if span.get("is_primary")),
            None,
        )
        if primary is None:
            continue
        file = str(primary["file_name"])
        number = int(primary["line_start"])
        text = str(message.get("message", "")).splitlines()[0]
        key = (file, number, str(code), text)
        if key in seen:
            continue
        seen.add(key)
        found.append(
            Diagnostic(
                crate=workspace.attribute(file),
                code=str(code),
                file=file,
                line=number,
                message=text,
            )
        )
    return found


def step_fmt(workspace: Workspace, package: str | None) -> StepResult:
    result = StepResult("fmt", ran=True)
    command = ["cargo", "fmt"]
    command += ["-p", package] if package else ["--all"]
    command += ["--", "--check"]
    done = run(command, workspace.root)
    result.status = done.returncode
    result.stderr_tail = tail(done.stderr) or tail(done.stdout)
    for line in done.stdout.splitlines():
        match = FMT_DIFF.match(line)
        if match:
            file = match.group("file")
            result.diagnostics.append(
                Diagnostic(
                    crate=workspace.attribute(file),
                    code="rustfmt",
                    file=file,
                    line=int(match.group("line")),
                    message="formatting differs from rustfmt",
                )
            )
    return result


def step_clippy(workspace: Workspace, package: str | None, count: int | None) -> StepResult:
    result = StepResult("clippy", ran=True)
    command = (
        ["cargo", "clippy"]
        + scope(package)
        + ["--all-targets", "--message-format=json"]
        + jobs(count)
        + ["--"]
        + LINTS
    )
    done = run(command, workspace.root)
    result.status = done.returncode
    result.stderr_tail = tail(done.stderr)
    result.diagnostics = parse_json_diagnostics(done.stdout, workspace)
    return result


def rustdoc_flags(root: Path) -> str:
    """Denies warnings on top of `build.rustdocflags`, which RUSTDOCFLAGS would replace."""
    configured: list[str] = []
    path = root / ".cargo" / "config.toml"
    if path.is_file():
        try:
            value = (tomllib.loads(path.read_text(encoding="utf-8")).get("build") or {}).get(
                "rustdocflags"
            )
        except (OSError, tomllib.TOMLDecodeError, AttributeError):
            value = None
        if isinstance(value, str):
            configured = value.split()
        elif isinstance(value, list):
            configured = [str(item) for item in value]
    parts = [*configured, os.environ.get("RUSTDOCFLAGS", ""), "-D warnings"]
    return " ".join(part for part in parts if part.strip())


def step_doc(workspace: Workspace, package: str | None, count: int | None) -> StepResult:
    result = StepResult("doc", ran=True)
    command = ["cargo", "doc", "--no-deps", "--message-format=json"] + scope(package) + jobs(count)
    done = run(
        command,
        workspace.root,
        env={"RUSTDOCFLAGS": rustdoc_flags(workspace.root)},
    )
    result.status = done.returncode
    result.stderr_tail = tail(done.stderr)
    result.diagnostics = parse_json_diagnostics(done.stdout, workspace)
    return result


def parse_test_failures(stdout: str) -> list[str]:
    """Reads the indented names out of every libtest `failures:` block."""
    names: list[str] = []
    collecting = False
    for line in stdout.splitlines():
        stripped = line.strip()
        if stripped == "failures:":
            collecting = True
            continue
        if not collecting:
            continue
        if not stripped or stripped.startswith("test result:"):
            collecting = False
            continue
        match = TEST_FAIL.match(line.rstrip())
        if match:
            name = match.group("name").strip()
            if name and name not in names:
                names.append(name)
        else:
            collecting = False
    return names


def package_name(package_id: str) -> str:
    """Reads the package name from current and legacy cargo package IDs."""
    fragment = package_id.rsplit("#", 1)[-1]
    if "@" in fragment:
        return fragment.rsplit("@", 1)[0]
    return Path(package_id.split("#", 1)[0]).name if "#" in package_id else package_id.split()[0]


def executable_key(path: str, root: Path) -> str:
    executable = Path(path)
    return str(executable if executable.is_absolute() else root / executable)


def parse_test_identities(output: str, root: Path) -> dict[str, list[str]]:
    """Qualifies libtest case names with their cargo package and target."""
    found = {"passed": [], "failed": [], "ignored": []}
    executables: dict[str, str] = {}
    doc_targets: dict[str, str] = {}
    suite: str | None = None
    statuses = {"ok": "passed", "FAILED": "failed", "ignored": "ignored"}
    for line in output.splitlines():
        if line.startswith("{"):
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                continue
            if event.get("reason") != "compiler-artifact":
                continue
            target = event.get("target") or {}
            kinds = target.get("kind") or []
            name = target.get("name")
            package_id = event.get("package_id")
            if not kinds or not isinstance(name, str) or not isinstance(package_id, str):
                continue
            package = package_name(package_id)
            doc_targets[name] = package
            if isinstance(event.get("executable"), str):
                executables[executable_key(event["executable"], root)] = (
                    f"{package}:{kinds[0]}:{name}"
                )
            continue
        if match := TEST_SUITE.fullmatch(line):
            suite = executables.get(executable_key(match.group("executable"), root))
            continue
        if match := DOC_SUITE.fullmatch(line):
            target = match.group("target")
            suite = f"{doc_targets[target]}:doc" if target in doc_targets else None
            continue
        if suite is not None and (match := TEST_CASE.fullmatch(line)):
            found[statuses[match.group("status")]].append(f"{suite} {match.group('name')}")
    return {status: sorted(set(names)) for status, names in found.items()}


def identity_counts_match(tests: dict[str, list[str]], totals: dict[str, int]) -> bool:
    return all(len(tests[status]) == totals[status] for status in ("passed", "failed", "ignored"))


def step_test(workspace: Workspace, package: str | None, count: int | None) -> StepResult:
    result = StepResult("test", ran=True)
    command = (
        ["cargo", "test"]
        + scope(package)
        + ["--no-fail-fast", "--message-format=json"]
        + jobs(count)
    )
    done = run(command, workspace.root, merge_stderr=True)
    result.status = done.returncode
    result.stderr_tail = tail(done.stdout)
    result.failures = parse_test_failures(done.stdout)
    result.tests = parse_test_identities(done.stdout, workspace.root)
    summaries = [
        line.strip() for line in done.stdout.splitlines() if line.startswith("test result:")
    ]
    matches = [TEST_TOTAL.fullmatch(line) for line in summaries]
    if matches and all(matches):
        totals = dict.fromkeys(TOTAL_FIELDS, 0)
        totals["suites"] = len(matches)
        for match in matches:
            if match is not None:
                for key, value in zip(TOTAL_FIELDS, match.groups(), strict=True):
                    totals[key] += int(value)
        result.totals = totals
        if not identity_counts_match(result.tests, totals):
            result.errors.append("test identities do not match totals")
    return result


def tail(text: str, lines: int = 8) -> str:
    kept = [line for line in text.splitlines() if line.strip()][-lines:]
    return "\n".join(kept)


def per_crate(
    results: dict[str, StepResult],
    workspace: Workspace,
    package: str | None,
) -> dict[str, dict[str, int]]:
    """Counts per crate, seeded with every crate in scope so zero rows show."""
    table: dict[str, dict[str, int]] = defaultdict(lambda: dict.fromkeys(STEPS, 0))
    seeded = [package] if package else sorted(workspace.crates)
    for crate in seeded:
        table[crate] = dict.fromkeys(STEPS, 0)
    table[WORKSPACE] = dict.fromkeys(STEPS, 0)
    for name, result in results.items():
        for diagnostic in result.diagnostics:
            table[diagnostic.crate][name] += 1
        if name == "test":
            for _ in result.failures:
                table[WORKSPACE][name] += 1
    return dict(table)


def render(
    results: dict[str, StepResult],
    table: dict[str, dict[str, int]],
    green: bool,
    baseline: BaselineComparison | None = None,
) -> str:
    out: list[str] = []
    width = max([len(name) for name in table] + [len("crate")]) if table else len("crate")
    out.append(f"{'crate'.ljust(width)}  {'fmt':>5} {'clippy':>7} {'doc':>5} {'test':>5}")
    out.append("-" * (width + 28))
    for crate in sorted(table):
        counts = table[crate]
        out.append(
            f"{crate.ljust(width)}  {counts['fmt']:>5} {counts['clippy']:>7} "
            f"{counts['doc']:>5} {counts['test']:>5}"
        )
    if not table:
        out.append("(no diagnostics)")

    grouped: dict[str, dict[str, list[Diagnostic]]] = defaultdict(lambda: defaultdict(list))
    for result in results.values():
        for diagnostic in result.diagnostics:
            grouped[diagnostic.crate][diagnostic.code].append(diagnostic)
    for crate in sorted(grouped):
        out.append("")
        out.append(f"## {crate}")
        for code in sorted(grouped[crate], key=lambda c: (-len(grouped[crate][c]), c)):
            hits = grouped[crate][code]
            out.append(f"  {code} ({len(hits)})")
            for hit in hits[:SHOWN_PER_CODE]:
                out.append(f"    {hit.where()}  {hit.message}")
            if len(hits) > SHOWN_PER_CODE:
                out.append(f"    ... {len(hits) - SHOWN_PER_CODE} more")

    failures = results.get("test", StepResult("test")).failures
    if failures:
        out.append("")
        out.append(f"## failing tests ({len(failures)})")
        out.extend(f"  {name}" for name in failures)

    for name, result in results.items():
        if result.ran and result.status != 0 and not result.diagnostics and not result.failures:
            out.append("")
            out.append(f"## {name} failed with no parsed diagnostics (exit {result.status})")
            out.append(result.stderr_tail or "(no stderr)")

    test = results.get("test")
    if baseline is not None and baseline.compared and test is not None and test.totals is not None:
        out.append("")
        out.append(f"## retired tests ({len(baseline.retired)})")
        out.extend(f"  {name}" for name in baseline.retired)
        out.append(f"passed {baseline.previous_passed} -> {test.totals['passed']}")
    if test and test.totals is not None:
        out.append("")
        out.append("Tests: " + "; ".join(f"{value} {key}" for key, value in test.totals.items()))
    out.append("")
    out.append("GREEN" if green else "RED")
    return "\n".join(out)


@dataclass
class BaselineComparison:
    """Errors and visible test-set changes against one baseline."""

    errors: list[str] = field(default_factory=list)
    retired: list[str] = field(default_factory=list)
    added: list[str] = field(default_factory=list)
    previous_passed: int = 0
    compared: bool = False

    def changes(self) -> dict[str, list[str]]:
        return {"retired": self.retired, "added": self.added}


def baseline_comparison(
    path: Path, workspace: Workspace, package: str | None, test: StepResult | None
) -> BaselineComparison:
    comparison = BaselineComparison()
    try:
        baseline = json.loads(path.read_text())
        if baseline["workspace_root"] != str(workspace.root) or baseline["package"] != package:
            comparison.errors.append("baseline scope does not match this workspace/package")
            return comparison
        step = baseline["steps"]["test"]
        previous = step["totals"]
        if (
            not isinstance(previous, dict)
            or any(
                type(previous.get(key)) is not int or previous[key] < 0
                for key in (*TOTAL_FIELDS, "suites")
            )
            or previous["suites"] == 0
        ):
            comparison.errors.append("baseline has no reliable test totals")
            return comparison
        comparison.previous_passed = previous["passed"]
        expected = 1 if package else len(workspace.crates)
        if step["status"] != 0 and (previous["failed"] == 0 or previous["suites"] < expected):
            comparison.errors.append(
                "baseline test command failed without a complete run: "
                f"{previous['suites']} suites for {expected} crates, "
                f"{previous['failed']} reported failures"
            )
            return comparison
        identities = step.get("tests")
        if not isinstance(identities, dict) or any(
            not isinstance(identities.get(status), list)
            or any(not isinstance(name, str) for name in identities[status])
            for status in ("passed", "failed", "ignored")
        ):
            comparison.errors.append("baseline has no test identities; retake it")
            return comparison
        if not identity_counts_match(identities, previous):
            comparison.errors.append("baseline test identities do not match its totals; retake it")
            return comparison
        if test is None or test.totals is None:
            comparison.errors.append("cannot compare baseline without current test totals")
            return comparison
        if test.tests is None:
            comparison.errors.append("cannot compare baseline without current test identities")
            return comparison
        previous_ids = set().union(*(identities[status] for status in identities))
        current_ids = set().union(*(test.tests[status] for status in test.tests))
        comparison.retired = sorted(set(identities["passed"]) - current_ids)
        comparison.added = sorted(current_ids - previous_ids)
        comparison.compared = True
        comparison.errors.extend(
            f"newly ignored test: {name}"
            for name in sorted(set(test.tests["ignored"]) - set(identities["ignored"]))
        )
        comparison.errors.extend(
            f"failing test removed: {name}"
            for name in sorted(set(identities["failed"]) - current_ids)
        )
    except (OSError, ValueError, KeyError, TypeError) as error:
        comparison.errors.append(f"cannot read baseline: {error}")
    return comparison


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="gate.py",
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("-p", "--package", help="scope every step to one crate")
    parser.add_argument("--json", action="store_true", help="machine-readable output")
    parser.add_argument("--output", type=Path, help="write JSON artifact from this run")
    parser.add_argument(
        "--baseline",
        type=Path,
        help="reject newly ignored or removed failing tests; report test-set changes",
    )
    parser.add_argument("--jobs", type=int, help="cargo -j value")
    parser.add_argument("--manifest-path", type=Path, help="workspace Cargo.toml")
    parser.add_argument(
        "--skip",
        action="append",
        default=[],
        choices=list(STEPS),
        help="drop a step; repeatable",
    )
    args = parser.parse_args(argv)
    if args.jobs is not None and args.jobs < 1:
        parser.error("--jobs must be positive")

    try:
        workspace = read_workspace(args.manifest_path)
    except CargoUnavailable as error:
        print(f"gate.py: {error}", file=sys.stderr)
        return 2

    results: dict[str, StepResult] = {}
    wanted = [name for name in STEPS if name not in args.skip]
    for name in wanted:
        if name == "fmt":
            results[name] = step_fmt(workspace, args.package)
        elif name == "clippy":
            results[name] = step_clippy(workspace, args.package, args.jobs)
        elif name == "doc":
            results[name] = step_doc(workspace, args.package, args.jobs)
        else:
            results[name] = step_test(workspace, args.package, args.jobs)

    table = per_crate(results, workspace, args.package)
    errors: list[str] = []
    if args.skip:
        errors.append("incomplete gate: skipped " + ", ".join(args.skip))
    test = results.get("test")
    if test is not None:
        errors.extend(test.errors)
        if test.totals is None:
            errors.append("test output has no complete, recognised libtest summaries")
        elif test.totals["failed"]:
            errors.append(f"test summaries report {test.totals['failed']} failures")
    baseline = None
    if args.baseline:
        baseline = baseline_comparison(args.baseline, workspace, args.package, test)
        errors.extend(baseline.errors)
    green = not errors and not any(result.red for result in results.values())
    report = {
        "green": green,
        "complete": not args.skip,
        "workspace_root": str(workspace.root),
        "package": args.package,
        "lints": LINTS,
        "errors": errors,
        "crates": {crate: table[crate] for crate in sorted(table)},
        "steps": {
            name: {
                "ran": result.ran,
                "status": result.status,
                "diagnostics": [d.as_dict() for d in result.diagnostics],
                "failures": result.failures,
                "stderr_tail": result.stderr_tail,
                "totals": result.totals,
                "errors": result.errors,
                **({"tests": result.tests} if name == "test" else {}),
            }
            for name, result in results.items()
        },
    }
    if baseline is not None:
        report["tests_changed"] = baseline.changes()
    encoded = json.dumps(report, indent=2)
    if args.output:
        try:
            args.output.write_text(encoded + "\n")
        except OSError as error:
            print(f"gate.py: cannot write report: {error}", file=sys.stderr)
            return 2
    if args.json:
        print(encoded)
    else:
        if errors:
            print("\n".join(errors))
        print(render(results, table, green, baseline))
    return 0 if green else 1


if __name__ == "__main__":
    sys.exit(main())
