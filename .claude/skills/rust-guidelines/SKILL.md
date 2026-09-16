---
name: rust-guidelines
description: Write, refactor, or review Rust using a pinned Microsoft guideline library. Load only the rules relevant to the API, correctness, or performance decision at hand.
generated-by: numen-sync
---

# Rust guidelines

Use Microsoft's Pragmatic Rust Guidelines as the default Rust design reference. User instructions and the target repository's constraints take precedence. Apply guidance to the requested change; it is not a mandate to restructure existing code.

## Load only what the task needs

Resolve links relative to this skill's installed directory, not the working directory. Pick the relevant topic below, read its short index, then read only the individual rules that bear on the decision. Start with one topic and a few rules; expand when a concrete question requires it. Don't read the entire reference tree or every linked rule. Reuse guidance already in context.

| Task | Index |
| --- | --- |
| Naming, standard conventions, static checks, logging | [Universal](references/topics/universal.md) |
| Public APIs, error types, builders, generics, service ownership | [API design](references/topics/libs-ux.md) |
| Checked types, validation, test boundaries, global state | [Resilience](references/topics/libs-resilience.md) |
| Trait bounds, I/O abstractions, dependency types | [Interoperability](references/topics/libs-interop.md) |
| Cargo features and library build behavior | [Library builds](references/topics/libs-building.md) |
| Unsafe, soundness, panic contracts | [Correctness](references/topics/correctness.md) |
| Async scheduling, allocation, batching, profiling | [Performance](references/topics/performance.md) |
| Foreign calls and platform boundaries | [FFI](references/topics/ffi.md) |
| Declarative or procedural macros | [Macros](references/topics/macros.md) |
| Binary error handling, allocator or CPU choices | [Applications](references/topics/apps.md) |
| Workspace layout, edition, MSRV | [Project](references/topics/project.md) |
| Rustdoc and public examples | [Documentation](references/topics/docs.md) |
| Agent-facing APIs and meaningful tests | [AI](references/topics/ai.md) |

For a known `M-*` rule, locate its file directly under `references/microsoft/src/guidelines/`. Upstream cross-references use website anchors; resolve their `M-*` IDs to individual local files. `C-*` references point to the external Rust API Guidelines. Screenshots are not vendored; the linked upstream website supplies them if needed. These are design guidelines, not a substitute for the pinned dependency's API documentation, especially for cancellation and unsafe contracts.

## Local invariant policy

- Make the compiler enforce meaningful invariants where practical. Carry validated values through checked types, private fields, and consuming transitions when ordering matters. Constructors, deserialization, mutation, `Default`, and `Clone` must preserve the guarantee. Avoid wrappers that encode no useful distinction.
- Keep a numeric invariant in its type when that removes a real failure path, even where `M-STRONG-TYPES` prefers primitive public parameters. A type cannot freeze external facts such as permissions or connection liveness; check those at the operation.
- Preserve distinctions callers need, including rejection versus unknown outcome. Use Microsoft's public error-struct default where it fits; an internal domain enum is appropriate when exhaustive handling provides a concrete guarantee. Don't refactor existing error boundaries just to standardize their shape.
- Test the enforcing boundary. For guarantees enforced by types, pair focused compile-fail coverage with a valid compiling use; test deserialization and external effects separately. Mocks and compilation do not establish production protocol or authorization behavior.

Use the repository's verification commands. In review, cite applicable rule IDs with the concrete consequence; a stylistic preference alone does not establish a correctness defect.

The upstream revision, file hashes, and license are in [upstream.json](references/microsoft/upstream.json) and [LICENSE.md](references/microsoft/LICENSE.md). Read them only when auditing or updating the vendored source.
