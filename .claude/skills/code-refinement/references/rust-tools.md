# Rust tools (optional strict route)

Choose verification before editing. The repository's native checks are the default. These Cargo-only helpers are an optional, stricter route for a Rust workspace; they don't replace the native workflow for other languages. `numen refine` owns cross-language debt discovery and tracking; this gate owns verification evidence, with Rust candidates and dependency lanes as supplements. Refine's native rustdoc scan follows project flag precedence as described in [native scan configuration](native-scans.md); its result does not establish this strict gate passed. Once selected, don't switch routes, omit `--baseline`, or replace the baseline after a gate failure to get a green result.

The gate tracks each test by suite and name rather than by count. With `--baseline` it lists every retired and added test, goes red when a test that failed in the baseline has disappeared, and goes red when any test becomes newly ignored. Retirement is expected when a type makes a case unrepresentable, but the gate cannot judge whether a retirement was justified: review each retired test's obligation and the surviving witness, per code-golf's proof-and-tests policy, before accepting the stage.

The tools are `numen` subcommands on PATH. Run from the Cargo workspace root, read each subcommand's `--help` for flags, and honour the repository's lockfile, Cargo jobs, and memory constraints. Use a unique report directory such as `/tmp/refinement-rust-<run-id>` and set `run_dir` to its absolute path before running these commands.

## Baseline

```sh
run_dir=$(mktemp -d /tmp/refinement-rust-XXXXXX)
numen run -- numen gate --output "$run_dir/gate-0.json"
numen candidates --json > "$run_dir/candidates-0.json"
numen lanes --lanes 4 --gate-json "$run_dir/gate-0.json" --json > "$run_dir/lanes-0.json"
```

Save candidate and lane output: the candidate JSON is the line-count baseline for `--baseline`. Gate writes JSON even when its checks are red, but an invocation or metadata error is a blocker, not a usable baseline. Record diagnostic counts and test totals. If compilation prevents complete libtest summaries, say totals are unavailable and use the first run with complete summaries as the comparison baseline, never zero. Candidate hits are Rust-only heuristic review prompts, not proof of defects or complete guideline coverage. Record active categories, test/generated exclusions, parse failures and known blind spots. Review errors, type invariants, ownership, APIs, idioms, async lifetime, structure, suppressions, docs, tests, manifests and dead/public code even when tools report zero hits. Some push an invariant into the type system, some point at code that can be deleted, and categories the repository's configured clippy lints already enforce are skipped and named as covered. The lane plan's `stages` are dependency ordered. Only lanes within one stage may run concurrently; dependency cycles stay in one lane, and `intra_crate: true` identifies potential shared contracts, not an exclusive file claim. Keep inseparable changes together; serialize conflicting edits in a shared working copy, but isolated cowork tasks can share a crate and revalidate after integration.

## Ownership and verification

Give fix agents a concrete outcome, relevant source areas, diagnostics and applicable `rust-guidelines` and `code-golf` excerpts. They read missing rules as needed, inspect affected callers and fix causes rather than suppressing diagnostics. Follow the active repository/cowork workspace mode: isolated task workspaces may edit shared contracts and make local VCS changes under that workflow; source areas are not exclusive file reservations. In a shared working copy, coordinate overlapping edits and verify only after the affected tree is stable. Coordinate manifests, lockfiles, configuration and caller migrations as part of the same contract change. Complete each dependency stage before the next. One verifier runs the complete gate against the settled integrated candidate after the stage or wave:

```sh
numen run -- numen gate --baseline "$run_dir/gate-0.json" --output "$run_dir/gate-1.json"
numen candidates --baseline "$run_dir/candidates-0.json"
```

The gate runs all four steps despite an earlier failure: rustfmt check, clippy pedantic and nursery warnings, rustdoc with warnings denied, and tests. Diagnostics, nonzero exit codes, failed or missing test summaries, or skipped steps make it red. `--skip` is diagnostic only, never a passing gate. With `--baseline`, the workspace/package scope and complete test summaries must match, no baseline-failing test may disappear, and no test may become newly ignored; retired tests are listed for review, not rejected. The candidate `--baseline` prints the scanned root's net production and test line change; pass a lane path with a baseline taken from that same path for a lane's figure. Net production growth must name the correctness, lifecycle or compatibility obligation it preserves and why a smaller change would fail it. Don't disable lints, add allow attributes, weaken assertions, ignore tests, delete a failing test, or change lint/formatter policy just to pass. Group failures by source path, update task scope when dependencies change, and converge with another fix stage and one verifier. If the gate cannot pass, report the blocker honestly instead of changing verification routes. Independent review comes before completion; commit only reviewed and verified logical changes, and don't push without authorization.
