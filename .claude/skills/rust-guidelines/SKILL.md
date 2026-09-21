---
name: rust-guidelines
description: Write, refactor, or review Rust using pinned Rust community guidelines and Microsoft additions. Load only the rules relevant to the API, correctness, or performance decision at hand.
generated-by: numen-sync
---

# Rust guidelines

Use the Rust community guidelines as the baseline and Microsoft's Pragmatic Rust Guidelines as additions and explicit overrides. Silence in Microsoft is not an exemption from the baseline. User instructions, the target repository's constraints, and the local invariant policy below take precedence over both. Rust language safety requirements cannot be overridden by a design preference. Apply guidance to the requested change; it is not a mandate to restructure existing code.

## Load only what the task needs

Resolve links relative to this skill's installed directory, not the working directory. Pick the relevant topic below, read its short index, then read the relevant baseline sections and Microsoft rules together. Read only the sections that bear on the decision. Start with one topic and a few rules; expand when a concrete question requires it. Don't read the entire reference tree or every linked rule. Reuse guidance already in context.

| Task | Index |
| --- | --- |
| Baseline source map, formatting, design patterns, known `C-*` rules | [Upstream sources](references/topics/upstream.md) |
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

For a known `M-*` rule, locate its file directly under `references/microsoft/src/guidelines/`. Upstream cross-references use website anchors; resolve their `M-*` IDs to individual local files. `C-*` references resolve through the local [API checklist](references/rust-api-guidelines/src/checklist.md). Its reference definitions map each ID to a chapter and anchor; open that local chapter and find the ID. For upstream website links, use the [source map](references/topics/upstream.md) instead of fetching a baseline already vendored. Treat `.html` chapter links as `.md` when reading the source. Screenshots are not vendored; the linked upstream website supplies them if needed. These are design guidelines, not a substitute for the pinned dependency's API documentation, especially for cancellation and unsafe contracts.

## Local invariant policy

- Make the compiler enforce meaningful invariants where practical. Carry validated values through checked types, private fields, and consuming transitions when ordering matters. Constructors, deserialization, mutation, `Default`, and `Clone` must preserve the guarantee. Avoid wrappers that encode no useful distinction.
- Keep a numeric invariant in its type when that removes a real failure path, even where `M-STRONG-TYPES` prefers primitive public parameters. A type cannot freeze external facts such as permissions or connection liveness; check those at the operation.
- Preserve distinctions callers need, including rejection versus unknown outcome. Use Microsoft's public error-struct default where it fits; an internal domain enum is appropriate when exhaustive handling provides a concrete guarantee. Don't refactor existing error boundaries just to standardize their shape.
- Test the enforcing boundary. For guarantees enforced by types, pair focused compile-fail coverage with a valid compiling use; test deserialization and external effects separately. Mocks and compilation do not establish production protocol or authorization behavior.

Use the repository's verification commands. In review, cite applicable rule IDs with the concrete consequence; a stylistic preference alone does not establish a correctness defect.

Each source directory has an `upstream.json` recording its repository, pinned revision, selection, file hashes, and license, alongside the original license files. The [source map](references/topics/upstream.md) links the manifests, including [Microsoft](references/microsoft/upstream.json). Read them only when auditing or updating the vendored source.
