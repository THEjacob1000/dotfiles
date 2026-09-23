# Rust tools (optional strict route)

Choose verification before editing. The repository's native checks are the default. These Cargo-only helpers are an optional, stricter route for a Rust workspace; they don't replace the native workflow for other languages. Once selected, don't switch routes, omit `--baseline`, or replace the baseline after a gate failure to get a green result. A native route may retire an individually reviewed obsolete test obligation only if the repository's governing policy permits it and the surviving boundary behavior is covered. The strict helper has no retirement allowance: its `--baseline` rejects fewer passing tests or suites and more ignored tests, even for an otherwise justified retirement. Pick the native route up front if such retirement is part of the intended change.

The strict route forbids retiring tests, but counts alone cannot enforce that policy. Review the baseline and current test identities, assertions and obligations alongside the helper report. Removing a previously failing test can leave the passing total unchanged; replacing a passing test can hide another removal. Neither is allowed to turn a red baseline green, and a green helper exit is not proof that no test disappeared.

The three stdlib-only scripts are in the installed `code-refinement/rust` directory, not the target repository. In the examples below, `skill` is the absolute path to the installed `code-refinement` directory. Run from the Cargo workspace root, read each script's `--help` for flags, and honour the repository's lockfile, Cargo jobs, and memory constraints. Use a unique report directory such as `/tmp/refinement-rust-<run-id>` and set `run_dir` to its absolute path before running these commands.

## Baseline

```sh
python3 "$skill/rust/gate.py" --output "$run_dir/gate-0.json"
python3 "$skill/rust/candidates.py" --json
python3 "$skill/rust/lanes.py" --lanes 4 --gate-json "$run_dir/gate-0.json" --json
```

Save candidate and lane output if needed for dispatch. Gate writes JSON even when its checks are red, but an invocation or metadata error is a blocker, not a usable baseline. Record diagnostic counts and test totals. If compilation prevents complete libtest summaries, say totals are unavailable and use the first run with complete summaries as the comparison baseline, never zero. Candidate hits are seven Rust-only heuristic review prompts, not proof of defects or a complete inventory; inspect the code against `rust-guidelines` beyond these categories. The lane plan's `stages` are dependency ordered. Only lanes within one stage may run concurrently; dependency cycles stay in one lane, and units sharing a crate with `intra_crate: true` must go to one agent or run serially because they are one compilation unit.

## Ownership and verification

Give fix agents exact owned lane paths and relevant diagnostics. They load `rust-guidelines`, inspect affected callers, fix the cause rather than suppressing diagnostics, and don't run Cargo, tests, builds, or verification against concurrent edits. The orchestrator owns manifests, lockfiles, toolchain, lint/formatter configuration and CI, coordinates shared APIs and caller migrations, and completes one dependency stage before dispatching the next. Fix agents make no VCS writes. One verifier runs the complete gate after the integrated fix stage or wave:

```sh
python3 "$skill/rust/gate.py" --baseline "$run_dir/gate-0.json" --output "$run_dir/gate-1.json"
python3 "$skill/rust/candidates.py" --json
```

The gate runs all four steps despite an earlier failure: rustfmt check, clippy pedantic and nursery warnings, rustdoc with warnings denied, and tests. Diagnostics, nonzero exit codes, failed or missing test summaries, or skipped steps make it red. `--skip` is diagnostic only, never a passing gate. With `--baseline`, the workspace/package scope and complete test summaries must match; passing-test and suite totals cannot decrease and ignored tests cannot increase. Don't disable lints, add allow attributes, weaken assertions, ignore or delete tests, or change lint/formatter policy just to pass. Group failures by source path, update lane ownership when dependencies change, and converge with another fix stage and one verifier. If the gate cannot pass, report the blocker honestly instead of changing verification routes. Independent review comes before completion; commit only reviewed and verified logical changes, and don't push without authorization.
