# Native scan configuration

The debt scanner invokes installed native analyzers where available. Inspect per-detector coverage and errors alongside findings; skipped or reduced coverage is not a clean result. Keep the selected repository test/build gate separate. Set repeated scan options with `--lang-opt KEY=VALUE`; retain the same options when comparing scans. A language-filtered scan covers that language only.

## Go

Native phases run once per nearest `go.mod` owning scoped Go sources, including nested modules and modules inside a scanned `go.work` tree. A subdirectory scan invokes its containing module and retains diagnostics only for scoped source files. Go itself resolves the active workspace; ambient `GOWORK`, build tags and platform selection still matter. External `go.work` members outside the selected tree are not traversed, and a module without scoped Go source does not run.

Missing module ownership or failed tools reduce coverage if other modules succeeded, otherwise skip the phase. A nonzero `go vet` result can contain useful diagnostics and still have reduced coverage because compilation may be incomplete. Verify affected modules with their real CI commands, including the applicable tags, platforms and race checks; a scan of one build selection does not verify the matrix.

## TypeScript and JavaScript

TypeScript compiler discovery looks for `tsconfig.json` and `tsconfig.*.json` along scoped source ancestors inside the scan root, and follows project references inside that root. Run from the owning project/workspace root so its configuration is visible. External or unreadable references reduce coverage. Every matching config is a candidate, including extends-only templates, which can produce diagnostics when checked independently; discovery does not infer the repository's exact build graph.

The compiler must be available at the scan root's `node_modules/.bin/tsc`. Each discovered project uses `tsc --project` with no emit and unused-local/parameter diagnostics. The compiler's `--listFiles` output establishes which indexed TypeScript files were checked; omitted files reduce compiler and unused-code coverage. Compiler errors remain findings alongside unused code; inspect configuration or resolution failures before treating unused diagnostics as complete. Deno projects need their own compiler gate. Missing configuration or compiler availability can leave only heuristic unused-code evidence with reduced coverage; compiler coverage is reported separately. JavaScript and TypeScript share the ESLint adapter; mixed scans invoke it once, and autofix stays within selected files. ESLint's checked-file output establishes coverage; ignored or missing indexed files reduce it, and an incomplete selected-file postcheck cannot resolve findings.

Use the package's real typecheck/build scripts for verification, especially when project references require declaration outputs, generated inputs or a custom runtime. Preserve the same root and config selection in baseline and final scans.

## Rust

Rust native check, clippy and rustdoc phases accept these `--lang-opt` keys:

| Key | Selection |
| --- | --- |
| `cargo_features` | Comma- or space-delimited Cargo feature names; explicit features disable the implicit all-features default. |
| `cargo_all_features` | `true` or `false`; defaults to true unless explicit features or `cargo_no_default_features=true` select otherwise. `false` alone uses Cargo's default features. |
| `cargo_no_default_features` | `true` or `false`; true disables default features. |
| `cargo_all_targets` | `true` or `false`; defaults true for check/clippy. Rustdoc stays library-scoped. |
| `cargo_target` | Target triple or JSON target path passed to Cargo. |

For a crate whose supported build disables default features:

```sh
numen refine scan --lang rust --lang-opt cargo_no_default_features=true --lang-opt cargo_features=server
```

Use the crate's actual feature names. Explicit `cargo_all_features=true` conflicts with explicit features or no-default-features selection. Invalid booleans, blank features/target values and NUL values skip native coverage before invocation; correct the options before interpreting the result. With no options, the existing all-features scan remains the default. These options configure refine's native detectors, not the separate `numen gate` helper. Record the actual target and feature selection; one scan is not evidence for unexercised configurations.

Rustdoc runs one workspace `cargo doc --no-deps --lib` invocation across scoped library packages, preserving Cargo's workspace feature unification. Scanner lint defaults enter through Cargo's `build.rustdocflags`; effective flags follow Cargo precedence, so environment or target-specific rustdoc flags can replace those defaults. Inspect the effective project policy before interpreting documentation coverage. This scan honors project rustdoc policy; the optional strict gate retains its own verification contract.
