---
name: rust-guidelines
description: Write, refactor, or review Rust following Google's style guide, with local typed-error and exhaustive-API policies plus supplementary Rust community and Microsoft guidance.
generated-by: numen-sync
---

# Rust guidelines

Follow Google's Rust Style Guide closely. Precedence is user instructions and repository constraints, the local policy below, Google, then supplementary community and Microsoft guidance. Microsoft does not override Google; use its advice where compatible. Language safety requirements cannot be overridden by style preferences. Apply guidance to the requested change, not as a mandate to restructure existing code.

## Local policy

- Return `Result<T, E>` when an operation can fail, even if the cause is obvious. `Option<T>` means successful absence; use `Result<Option<T>, E>` when absence and failure are both possible. Operational failures in developer-facing CLIs also return `Result`, not panics. True invariant bugs follow the repository's panic policy.
- Prefer exhaustive enums and directly constructible structs where the API permits them. Do not add `#[non_exhaustive]` to either by default; it needs an explicit API-evolution requirement. This overrides Google's cross-team enum and public-field struct defaults. Respect existing published contracts and third-party non-exhaustive types.
- Use focused domain/subsystem error enums with `thiserror`, typed context and deliberate source preservation. Read [typed errors](references/topics/errors.md) whenever designing or changing an error boundary. This overrides Microsoft's public error-struct default; don't erase typed failures merely because the code is an application.
- Make meaningful invariants compiler-enforced where practical, through checked types, private fields and consuming transitions. Constructors, deserialization, mutation, `Default` and `Clone` must preserve them. Avoid wrappers without a useful distinction. Numeric invariants may justify checked public types despite `M-STRONG-TYPES`; external facts such as permission and liveness still need runtime checks.
- Test the enforcing boundary. For guarantees enforced by types, pair focused compile-fail coverage with a valid compiling use; test deserialization and external effects separately. Mocks and compilation do not establish production protocol or authorization behaviour.

## Load only what the task needs

Resolve links relative to this skill's installed directory, not the working directory. First use the [Google section index](references/topics/google.md) to read the sections relevant to the decision, including their exceptions and library/application scope. Then use the supplementary topic index below only for questions those sections leave open. Read a few relevant rules, not the whole reference tree; reuse guidance already in context. Platform-labelled Google rules apply only to that platform, not every Rust repository.

| Task | Index |
| --- | --- |
| Supplementary sources, formatting, design patterns, known `C-*` rules | [Upstream sources](references/topics/upstream.md) |
| Naming, standard conventions, static checks, logging | [Universal](references/topics/universal.md) |
| Public APIs, builders, generics, service ownership | [API design](references/topics/libs-ux.md) |
| Checked types, validation, test boundaries, global state | [Resilience](references/topics/libs-resilience.md) |
| Trait bounds, I/O abstractions, dependency types | [Interoperability](references/topics/libs-interop.md) |
| Cargo features and library build behavior | [Library builds](references/topics/libs-building.md) |
| Unsafe, soundness, panic contracts | [Correctness](references/topics/correctness.md) |
| Allocation, profiling, benchmarking, build tuning, async scheduling, batching | [Performance](references/topics/performance.md) |
| Foreign calls and platform boundaries | [FFI](references/topics/ffi.md) |
| Declarative or procedural macros | [Macros](references/topics/macros.md) |
| Application reporting, allocator or CPU choices | [Applications](references/topics/apps.md) |
| Workspace layout, edition, MSRV | [Project](references/topics/project.md) |
| Rustdoc and public examples | [Documentation](references/topics/docs.md) |
| Agent-facing APIs and meaningful tests | [AI](references/topics/ai.md) |

For a known `M-*` rule, locate its file directly under `references/microsoft/src/guidelines/`. Upstream cross-references use website anchors; resolve their `M-*` IDs to individual local files. `C-*` references resolve through the local [API checklist](references/rust-api-guidelines/src/checklist.md). Its reference definitions map each ID to a chapter and anchor; open that local chapter and find the ID. For upstream website links, use the [source map](references/topics/upstream.md) instead of fetching a baseline already vendored. Treat `.html` chapter links as `.md` when reading the source. Screenshots are not vendored; the linked upstream website supplies them if needed. These are design guidelines, not a substitute for the pinned dependency's API documentation, especially for cancellation and unsafe contracts.

Use the repository's verification commands. In review, cite the Google section or applicable supplementary rule ID with the concrete consequence; a stylistic preference alone does not establish a correctness defect.

Each vendored source directory has an `upstream.json` recording its repository, pinned revision, selection, file hashes, and license, alongside the original license files. The performance book is maintained in this repository instead and keeps only its licenses. The [source map](references/topics/upstream.md) links the manifests, including [Microsoft](references/microsoft/upstream.json). Read them only when auditing or updating the vendored source.
