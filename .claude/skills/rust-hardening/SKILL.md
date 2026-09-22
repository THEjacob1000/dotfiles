---
name: rust-hardening
description: Pedantically enforce the Rust guidelines over a whole repository in waves. Use when dropped into a badly written Rust project and asked to harden it, clean it up, or make it match the rust skill everywhere. Fans out fix agents that run no checks, then verifies once in a singleton and iterates on the results.
generated-by: numen-sync
---

# Rust hardening

Enforce `rust-guidelines` over an entire repository. The fix agents write; they never verify. One singleton verifies; it never fixes. That split is the whole method: parallel agents running cargo fight over the target directory and each one reports a red another lane caused.

Three scripts live beside this file, stdlib-only Python 3 so they run in any repo with no environment to set up. `<skill>` below is this skill's installed directory, not the working directory. Run them with `python3`, they ship non-executable. Every one takes `--help` with the full detail; read that when you need a flag rather than expecting it here.

Serialise cargo behind a lock if the repo's own conventions say to. Nothing in wave 1 runs cargo at all, so the only contention is wave 2 against whatever else is on the box.

## Wave 0, baseline

```sh
python3 <skill>/gate.py --json > /tmp/gate-0.json; python3 <skill>/gate.py | tail -40
python3 <skill>/candidates.py --json > /tmp/cand-0.json; python3 <skill>/candidates.py | head -30
python3 <skill>/lanes.py --lanes N --gate-json /tmp/gate-0.json
```

Record the totals. They are the only measure of whether a wave achieved anything, and the final report quotes the real ones.

Pick N from the lane table, not from a hunch: one agent per lane, and a lane is a leaf-first slice of the dependency order so the crates above it are repaired against an API that has stopped moving.

## Wave 1, fan out

One task agent per lane, all dispatched in the same message so they run concurrently. Each lane prompt carries its row from the lane table verbatim and these rules:

- Load `rust-guidelines` first. Fix this lane to it, and convert every candidate in the lane to a checked type, or justify it in a one-line comment saying what the ceiling is.
- Forbidden: running cargo, running tests, running any check or build. Another lane owns the target directory and a red you see is probably theirs.
- Forbidden: touching any file outside the lane's paths, and any shared manifest (`Cargo.toml`, `Cargo.lock`, `rustfmt.toml`, `clippy.toml`, CI config).
- Forbidden: `jj` or `git` writes of any kind. The orchestrator commits.
- Report what changed and what was left, in one line per file.

The first wave's job is code that looks perfect against the guidelines. It will not compile everywhere, and that is expected: a newtype introduced in a leaf breaks its callers by design.

## Wave 2, verify

One agent, alone, nothing else running:

```sh
python3 <skill>/gate.py --json > /tmp/gate-1.json; python3 <skill>/gate.py
```

`gate.py` runs fmt, clippy, doc and tests to completion regardless of failures, so one round gives the whole picture rather than the first thing that broke. It reports, it does not fix.

## Wave 3, converge

Group the red by lane from the JSON, fan out again with the same rules, verify again. Three rounds at most. If diagnostics survive three rounds, stop and hand back the list; a fourth round is the same agents re-deriving the same wrong fix.

Then `code-reviewer` per lane, and commit per crate, scoped by jj fileset to the paths that lane owned. The orchestrator commits, never the lanes.

## Done means

- Zero diagnostics under the gate's lint set: `clippy::pedantic`, `clippy::nursery`, `-D warnings`, plus rustfmt and rustdoc clean.
- Every candidate from `candidates.py` resolved into the type system, or justified in one line naming the ceiling.
- Tests green, with the same count as the baseline or more. Fewer tests passing is a regression however clean the clippy output is.

Forbidden throughout, in every wave, including the last one to go green: `#[allow(...)]`, `#![allow(...)]`, edits to `clippy.toml` / `rustfmt.toml` / lint attributes in a manifest, `#[ignore]`, `.skip`, deleting a test, and weakening an assertion. Every one of those turns a real defect into a silent one. Fix the root cause or report the blocker.
