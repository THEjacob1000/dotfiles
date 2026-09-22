---
name: rust-hardening
description: Enforce rust-guidelines across a Rust repository in dependency stages. Use for whole-repository hardening or cleanup, not a routine change. Parallel fix agents write without running checks; one verifier runs the gate and reports failures for the next wave.
generated-by: numen-sync
---

# Rust hardening

Load `rust-guidelines` and the target repository's instructions. Apply the actual guidelines to its code, not just the patterns a scanner recognises. Fix agents write and never verify; one verifier runs all checks and never fixes. Respect the repository's design/review gates before changing trust boundaries.

Three stdlib-only Python scripts live beside this file and run with `python3`, without installing dependencies. Set `skill` to this skill's installed directory, not the target repository. Read each script's `--help` for optional flags. Honour the repository's cargo lock, job and memory limits when running the gate.

## Baseline

Create a unique report directory and run from the target workspace root. The gate runs each step once, prints a summary, and saves the same run as JSON even when checks fail:

```sh
run_dir=$(mktemp -d /tmp/rust-hardening.XXXXXX)
python3 "$skill/gate.py" --output "$run_dir/gate-0.json"
python3 "$skill/candidates.py" --json > "$run_dir/candidates-0.json"
python3 "$skill/lanes.py" --lanes 4 --gate-json "$run_dir/gate-0.json" --json > "$run_dir/lanes.json"
```

A red baseline is expected; inspect the gate exit status and report before continuing. An invocation or metadata error is a blocker, not a clean baseline. Record actual test totals and diagnostic counts. If test compilation prevents totals, record them as unavailable, review the source diff for test preservation, and use the first run with completed test summaries as the comparison baseline for later waves. Never turn missing counts into zero.

Choose the lane count for available agents and repository constraints. Candidate hits are review prompts, not proof of defects: inspect each hit against `rust-guidelines`, fix real violations, and record false positives or justified exceptions in the report. Do not introduce a newtype or a code comment solely to make a scanner count disappear. A zero count is not proof that an area meets the guidelines.

## Fix stages

Read `stages` from the lane plan. Complete stages sequentially; only lanes within the same stage may run concurrently. Dependencies finish before their dependents, and crates in a dependency cycle stay together in one lane. Do not dispatch all stages at once.

Give each fix agent its exact lane paths, relevant diagnostics and these rules:

- Load `rust-guidelines` and inspect the relevant rules and callers before changing an API. Review the lane beyond the scanner's seven categories.
- Run no cargo, tests, builds or verification commands. Report what changed and any unresolved work.
- Edit only owned paths. Never edit shared workspace manifests, lockfiles, lint/formatter configuration or CI settings. Send necessary cross-lane or shared-file changes to the orchestrator instead.
- Make no VCS writes. The orchestrator reviews and commits each logical change with scoped paths.

The orchestrator coordinates caller updates and permitted shared-file changes. Do not hide a required fix behind an agent's ownership restriction. When a stage finishes, pass its API changes to the next stage before dispatching it.

## Verify and converge

After all fix agents have finished, one verifier runs the whole gate once. Substitute the current wave number for `1`; use `--baseline` only with a report containing completed test summaries:

```sh
python3 "$skill/gate.py" --baseline "$run_dir/gate-0.json" --output "$run_dir/gate-1.json"
python3 "$skill/candidates.py" --json > "$run_dir/candidates-1.json"
```

The gate runs rustfmt, clippy with `clippy::pedantic`, `clippy::nursery` and `-D warnings`, rustdoc with warnings denied, and tests despite failures in earlier steps. Partial runs are diagnostic only. Group failures by their source paths, update the lane plan if dependencies changed, then repeat the staged fixes and single verification. At most three fix/verify rounds; after that report remaining defects and stop rather than declaring success.

Before completion, run an independent code review and resolve its findings. Any review-driven edit needs the applicable checks again. Commit only reviewed, verified logical changes, scoped to owned paths; do not push without explicit authorization.

## Completion

All four gate steps must complete successfully. Passing-test totals must not fall below the recorded baseline, and tests must not be removed, ignored or weakened. Report any unavailable initial totals honestly. Review every remaining candidate and record why it is acceptable; scanner output does not replace guideline review. Report the actual before/after test and diagnostic counts, remaining exceptions and local commits.

Never disable lint rules, add allow attributes, suppress diagnostics, alter lint/formatter policy, ignore or delete tests, or weaken assertions to make the gate pass. Fix the cause or report the blocker.
