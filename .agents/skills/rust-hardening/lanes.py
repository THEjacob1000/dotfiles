#!/usr/bin/env python3
"""Schedule hardening in dependency stages with parallel lanes inside each stage.

Finish every lane in a stage before starting the next stage. Workspace path
normal, build and dev dependencies all impose this ordering. Pathless dependencies
matching member names also impose ordering because Cargo patches can resolve them locally.
Dependency cycles are grouped into one lane, so their crates are edited serially.

--lanes N caps concurrent agents within a stage. Weight is the diagnostic count
from gate.py --json with --gate-json, and the source-file count otherwise.
A crate above --split-share is split by src directory; its root unit owns the
remaining files, including its tests and build script. Every unit of a split
crate carries the same `crate` name and `intra_crate: true`: they edit one
compilation unit with no ordering between them, so the orchestrator gives them
to one agent or runs them one after another. Units with intersecting ownership
paths always stay together in a single lane.

Manifests, lockfiles, lint and formatter configuration, the toolchain file and
CI settings are never assigned to a unit; they stay orchestrator-owned. Agents
must stay within the listed paths.

Examples:
    python3 lanes.py --lanes 6
    python3 lanes.py --lanes 6 --gate-json /tmp/gate.json
    python3 lanes.py --json --manifest-path /repo/Cargo.toml
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from dataclasses import dataclass, field
from graphlib import TopologicalSorter
from pathlib import Path

ORCHESTRATOR_OWNED = {
    "target",
    ".git",
    ".jj",
    ".cargo",
    ".github",
    ".gitlab-ci.yml",
    ".circleci",
    ".travis.yml",
    "azure-pipelines.yml",
    "Cargo.lock",
    "Cargo.toml",
    "rustfmt.toml",
    ".rustfmt.toml",
    "clippy.toml",
    ".clippy.toml",
    "deny.toml",
}


class CargoUnavailable(RuntimeError):
    """cargo is missing, or could not read the workspace manifest."""


def reserved(name: str) -> bool:
    """Files the orchestrator keeps: a fix agent may not edit build or CI policy."""
    return name in ORCHESTRATOR_OWNED or name.startswith("rust-toolchain")


@dataclass
class Crate:
    """One workspace member and the workspace crates it depends on."""

    name: str
    directory: Path
    depends_on: set[str] = field(default_factory=set)
    weight: int = 0


def read_crates(manifest: Path | None) -> tuple[Path, dict[str, Crate]]:
    """Reads workspace members and intra-workspace edges from cargo metadata."""
    if shutil.which("cargo") is None:
        raise CargoUnavailable("cargo is not on PATH")
    command = ["cargo", "metadata", "--no-deps", "--format-version", "1"]
    if manifest is not None:
        command += ["--manifest-path", str(manifest)]
    done = subprocess.run(command, capture_output=True, text=True, check=False)
    if done.returncode != 0:
        raise CargoUnavailable(done.stderr.strip() or "cargo metadata failed")
    data = json.loads(done.stdout)
    try:
        root = Path(data.get("workspace_root", "."))
        members = set(data["workspace_members"])
        packages = [package for package in data["packages"] if package["id"] in members]
        paths = {
            Path(package["manifest_path"]).parent.resolve(): package["name"] for package in packages
        }
        crates: dict[str, Crate] = {}
        for package in packages:
            directory = Path(package["manifest_path"]).parent
            crates[package["name"]] = Crate(
                name=package["name"],
                directory=directory,
                depends_on={
                    name
                    for dependency in package.get("dependencies", [])
                    for name in [
                        paths.get(Path(dependency["path"]).resolve())
                        if dependency.get("path")
                        else dependency["name"]
                    ]
                    if name in paths.values() and name != package["name"]
                },
            )
    except (KeyError, TypeError, AttributeError) as error:
        raise CargoUnavailable(f"invalid cargo metadata: {error}") from error
    return root, crates


def dependency_stages(crates: dict[str, Crate]) -> list[list[list[str]]]:
    reachable = {}
    for name in crates:
        visited = set()
        pending = [name]
        while pending:
            current = pending.pop()
            if current not in visited:
                visited.add(current)
                pending.extend(crates[current].depends_on & crates.keys() - visited)
        reachable[name] = visited
    components: dict[str, list[str]] = {}
    owner = {}
    for name in sorted(crates):
        if name not in owner:
            members = sorted(other for other in reachable[name] if name in reachable[other])
            components[name] = members
            owner.update(dict.fromkeys(members, name))
    graph = TopologicalSorter(
        {
            name: {
                owner[dep]
                for member in members
                for dep in crates[member].depends_on
                if dep in owner and owner[dep] != name
            }
            for name, members in components.items()
        }
    )
    graph.prepare()
    stages = []
    while graph.is_active():
        ready = sorted(graph.get_ready())
        stages.append([components[name] for name in ready])
        graph.done(*ready)
    return stages


def source_weight(directory: Path) -> int:
    source = directory / "src"
    if not source.is_dir():
        return 1
    return max(1, sum(1 for _ in source.rglob("*.rs")))


def gate_weights(path: Path) -> dict[str, int]:
    data = json.loads(path.read_text(encoding="utf-8"))
    return {
        crate: sum(int(value) for value in counts.values())
        for crate, counts in data.get("crates", {}).items()
    }


@dataclass
class Unit:
    """One indivisible piece of work: a crate, or one module of a big crate."""

    label: str
    crate: str
    paths: list[str]
    weight: int
    intra_crate: bool = False


def split_unit(crate: Crate, root: Path, weight: int) -> list[Unit]:
    """Splits a dominant crate into one unit per top-level src/ directory."""
    source = crate.directory / "src"
    modules = (
        sorted(child for child in source.iterdir() if child.is_dir()) if source.is_dir() else []
    )
    if not modules:
        return [Unit(crate.name, crate.name, [relative(crate.directory, root)], weight)]
    files = sorted(child for child in source.iterdir() if not child.is_dir())
    files += sorted(
        child for child in crate.directory.iterdir() if child != source and not reserved(child.name)
    )
    share = max(1, weight // (len(modules) + 1))
    units = [
        Unit(
            f"{crate.name}:{module.name}",
            crate.name,
            [relative(module, root)],
            share,
            intra_crate=True,
        )
        for module in modules
    ]
    units.append(
        Unit(
            f"{crate.name}:.",
            crate.name,
            [relative(path, root) for path in sorted(files)],
            share,
            intra_crate=True,
        )
    )
    return units


def relative(path: Path, root: Path) -> str:
    try:
        return path.relative_to(root).as_posix()
    except ValueError:
        return path.as_posix()


def owned_paths(directory: Path, boundaries: set[Path]) -> list[Path]:
    """Ownership for one path: the whole directory, or the children left after exclusions."""
    if directory in boundaries or reserved(directory.name):
        return []
    if not directory.is_dir():
        return [directory]
    try:
        children = sorted(directory.iterdir())
    except OSError:
        return []
    if any(boundary.is_relative_to(directory) for boundary in boundaries) or any(
        reserved(child.name) for child in children
    ):
        return [
            path
            for child in children
            if not reserved(child.name)
            for path in owned_paths(child, boundaries)
        ]
    return [directory]


def build_units(
    root: Path,
    crates: dict[str, Crate],
    order: list[str],
    weights: dict[str, int],
    split_share: float,
) -> list[Unit]:
    total = sum(max(weights.get(name, 0), 1) for name in order)
    units: list[Unit] = []
    for name in order:
        crate = crates[name]
        weight = max(weights.get(name, 0), 1)
        pieces = (
            split_unit(crate, root, weight)
            if total and weight / total > split_share
            else [Unit(name, name, [relative(crate.directory, root)], weight)]
        )
        boundaries = {other.directory for other in crates.values() if other != crate}
        for piece in pieces:
            piece.paths = [
                relative(owned, root)
                for path in piece.paths
                for owned in owned_paths(root / path, boundaries)
            ]
            if piece.paths:
                units.append(piece)
    return units


def overlaps(left: Unit, right: Unit) -> bool:
    return any(
        Path(a).is_relative_to(b) or Path(b).is_relative_to(a)
        for a in left.paths
        for b in right.paths
    )


def partition(units: list[Unit], lanes: int, components: list[list[str]]) -> list[list[Unit]]:
    owner = {
        name: index for index, group in enumerate(components) if len(group) > 1 for name in group
    }
    groups: list[list[Unit]] = []
    for unit in units:
        joined = [unit]
        separate = []
        for group in groups:
            if any(
                overlaps(unit, other)
                or (unit.intra_crate and other.crate == unit.crate)
                or (unit.crate in owner and owner.get(other.crate) == owner[unit.crate])
                for other in group
            ):
                joined.extend(group)
            else:
                separate.append(group)
        groups = [*separate, joined]
    buckets: list[list[Unit]] = [[] for _ in range(min(lanes, len(groups)))]
    for group in sorted(groups, key=lambda group: -sum(unit.weight for unit in group)):
        bucket = min(buckets, key=lambda bucket: sum(unit.weight for unit in bucket))
        bucket.extend(group)
    return buckets


def schedule(units: list[Unit], dependencies: list[list[list[str]]], lanes: int) -> list[dict]:
    stages = []
    for number, components in enumerate(dependencies, start=1):
        names = {name for component in components for name in component}
        stage_units = [unit for unit in units if unit.crate in names]
        buckets = partition(stage_units, lanes, components)
        stages.append(
            {
                "stage": number,
                "lanes": [
                    {
                        "lane": lane,
                        "weight": sum(unit.weight for unit in bucket),
                        "units": [vars(unit) for unit in bucket],
                    }
                    for lane, bucket in enumerate(buckets, start=1)
                ],
            }
        )

    return stages


def render(stages: list[dict], order: list[str], weighting: str) -> str:
    out = [f"dependency order ({weighting} weighting):", "  " + " -> ".join(order)]
    for stage in stages:
        out.append(f"\nstage {stage['stage']} (finish before the next stage):")
        out.append("lane  weight  paths")
        for lane in stage["lanes"]:
            paths = ", ".join(path for unit in lane["units"] for path in unit["paths"])
            out.append(f"{lane['lane']:>4}  {lane['weight']:>6}  {paths}")
    return "\n".join(out)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="lanes.py",
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--lanes", type=int, default=1, help="number of lanes to partition into")
    parser.add_argument("--gate-json", type=Path, help="gate.py --json output, used as weights")
    parser.add_argument("--manifest-path", type=Path, help="workspace Cargo.toml")
    parser.add_argument(
        "--split-share",
        type=float,
        default=0.35,
        help="weight share above which a crate is split by module directory",
    )
    parser.add_argument("--json", action="store_true", help="machine-readable output")
    args = parser.parse_args(argv)

    if args.lanes < 1 or not 0 < args.split_share <= 1:
        parser.error("--lanes must be positive and --split-share must be in (0, 1]")
    try:
        root, crates = read_crates(args.manifest_path)
    except (CargoUnavailable, json.JSONDecodeError) as error:
        print(f"lanes.py: {error}", file=sys.stderr)
        return 2
    if not crates:
        print("lanes.py: no workspace members", file=sys.stderr)
        return 2

    try:
        dependencies = dependency_stages(crates)
        weights = (
            gate_weights(args.gate_json)
            if args.gate_json
            else {name: source_weight(crate.directory) for name, crate in crates.items()}
        )
    except (OSError, ValueError, TypeError, AttributeError) as error:
        print(f"lanes.py: invalid gate weights: {error}", file=sys.stderr)
        return 2
    if args.gate_json and not set(weights) & set(crates):
        print(
            "lanes.py: gate report names no crate in this workspace; weights are uniform",
            file=sys.stderr,
        )
    weighting = "diagnostic" if args.gate_json else "source-file"
    order = [name for stage in dependencies for component in stage for name in component]
    units = build_units(root, crates, order, weights, args.split_share)
    stages = schedule(units, dependencies, args.lanes)

    if args.json:
        print(
            json.dumps(
                {"root": str(root), "weighting": weighting, "order": order, "stages": stages},
                indent=2,
            )
        )
    else:
        print(render(stages, order, weighting))
    return 0


if __name__ == "__main__":
    sys.exit(main())
