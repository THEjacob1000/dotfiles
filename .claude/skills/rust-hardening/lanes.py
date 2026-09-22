#!/usr/bin/env python3
"""Partition a workspace into hardening lanes, leaves first.

`cargo metadata` gives the workspace members and their intra-workspace
dependency edges. Kahn's algorithm with a name tiebreak turns that into a
deterministic leaves-first order: a crate never appears before something it
depends on. Fixing a leaf first means the crates above it are repaired against
an API that has already stopped moving.

--lanes N walks that order and fills N lanes to an even weight, so the deepest
crate still lands in the earliest lane with room. Weight is the diagnostic
count from `gate.py --json` when --gate-json is given, and the source-file
count otherwise.

A crate holding more than --split-share of the total weight is split into one
sub-lane per top-level directory under its src/, which stops a god crate from
serialising a wave that was meant to be parallel.

The table is the brief the orchestrator pastes into each task prompt: one row
per lane, naming the paths that lane owns and nothing else.

Examples:
    python3 lanes.py --lanes 6
    python3 gate.py --json > /tmp/gate.json && python3 lanes.py --lanes 6 --gate-json /tmp/gate.json
    python3 lanes.py --json
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path


class CargoUnavailable(RuntimeError):
    """cargo is missing, or could not read the workspace manifest."""


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
    root = Path(data.get("workspace_root", "."))
    packages = data.get("packages", [])
    names = {package["name"] for package in packages}
    crates: dict[str, Crate] = {}
    for package in packages:
        directory = Path(package["manifest_path"]).parent
        crates[package["name"]] = Crate(
            name=package["name"],
            directory=directory,
            depends_on={
                dependency["name"]
                for dependency in package.get("dependencies", [])
                if dependency["name"] in names and dependency["name"] != package["name"]
            },
        )
    return root, crates


def leaves_first(crates: dict[str, Crate]) -> list[str]:
    """Kahn's algorithm over the dependency edges, name-tiebroken."""
    remaining = {name: set(crate.depends_on) & set(crates) for name, crate in crates.items()}
    order: list[str] = []
    while remaining:
        ready = sorted(name for name, deps in remaining.items() if not deps)
        if not ready:
            # A dependency cycle (dev-dependencies make these legal). Take the
            # least-blocked crate so the order stays total and deterministic.
            ready = [min(remaining, key=lambda name: (len(remaining[name]), name))]
        for name in ready:
            order.append(name)
            del remaining[name]
        for deps in remaining.values():
            deps.difference_update(ready)
    return order


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
    paths: list[str]
    weight: int


def split_unit(crate: Crate, root: Path, weight: int) -> list[Unit]:
    """Splits a dominant crate into one unit per top-level src/ directory."""
    source = crate.directory / "src"
    modules = (
        sorted(child for child in source.iterdir() if child.is_dir()) if source.is_dir() else []
    )
    if not modules:
        return [Unit(crate.name, [relative(crate.directory, root)], weight)]
    files = [child for child in source.glob("*.rs")] if source.is_dir() else []
    units = [
        Unit(
            f"{crate.name}:{module.name}",
            [relative(module, root)],
            max(1, weight // (len(modules) + 1)),
        )
        for module in modules
    ]
    units.append(
        Unit(
            f"{crate.name}:root",
            [relative(path, root) for path in sorted(files)],
            max(1, weight // (len(modules) + 1)),
        )
    )
    return units


def relative(path: Path, root: Path) -> str:
    try:
        return path.relative_to(root).as_posix()
    except ValueError:
        return path.as_posix()


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
        if total and weight / total > split_share:
            units.extend(split_unit(crate, root, weight))
        else:
            units.append(Unit(name, [relative(crate.directory, root)], weight))
    return units


def partition(units: list[Unit], lanes: int) -> list[list[Unit]]:
    """Fills lanes to an even weight, keeping the leaves-first order."""
    if lanes <= 1:
        return [list(units)]
    buckets: list[list[Unit]] = [[] for _ in range(lanes)]
    loads = [0] * lanes
    total = sum(unit.weight for unit in units) or 1
    target = total / lanes
    cursor = 0
    for unit in units:
        while cursor < lanes - 1 and loads[cursor] >= target:
            cursor += 1
        buckets[cursor].append(unit)
        loads[cursor] += unit.weight
    return buckets


def render(buckets: list[list[Unit]], order: list[str], weighting: str) -> str:
    out = [f"leaves-first order ({weighting} weighting):", "  " + " -> ".join(order), ""]
    width = max(len("lane"), len(str(len(buckets))))
    out.append(f"{'lane'.ljust(width)}  {'weight':>6}  paths")
    out.append("-" * 72)
    for number, bucket in enumerate(buckets, start=1):
        if not bucket:
            continue
        weight = sum(unit.weight for unit in bucket)
        paths = ", ".join(path for unit in bucket for path in unit.paths)
        out.append(f"{str(number).ljust(width)}  {weight:>6}  {paths}")
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

    try:
        root, crates = read_crates(args.manifest_path)
    except (CargoUnavailable, json.JSONDecodeError) as error:
        print(f"lanes.py: {error}", file=sys.stderr)
        return 2
    if not crates:
        print("lanes.py: no workspace members", file=sys.stderr)
        return 2

    order = leaves_first(crates)
    if args.gate_json:
        weights = gate_weights(args.gate_json)
        weighting = "diagnostic"
    else:
        weights = {name: source_weight(crate.directory) for name, crate in crates.items()}
        weighting = "source-file"

    units = build_units(root, crates, order, weights, args.split_share)
    buckets = partition(units, max(1, args.lanes))

    if args.json:
        print(
            json.dumps(
                {
                    "root": str(root),
                    "weighting": weighting,
                    "order": order,
                    "lanes": [
                        {
                            "lane": number,
                            "weight": sum(unit.weight for unit in bucket),
                            "units": [
                                {"label": unit.label, "paths": unit.paths, "weight": unit.weight}
                                for unit in bucket
                            ],
                        }
                        for number, bucket in enumerate(buckets, start=1)
                        if bucket
                    ],
                },
                indent=2,
            )
        )
    else:
        print(render(buckets, order, weighting))
    return 0


if __name__ == "__main__":
    sys.exit(main())
