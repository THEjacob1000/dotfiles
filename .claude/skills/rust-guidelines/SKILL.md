---
name: rust-guidelines
description: Write, refactor, or review Rust following Google's style guide, with local typed-error and exhaustive-API policies plus supplementary Rust community and Microsoft guidance.
generated-by: numen-sync
---

# Rust guidelines

Precedence: user instructions and repository constraints (including configured lints), local policy, Google, then compatible community and Microsoft guidance. Apply it to the requested change, not unrelated restructuring. The [panic policy](references/typed-errors.md#panic-policy) overrides Google's "prefer `expect`" and developer-binary exception and Microsoft's M-PANIC-ON-BUG.

## Local policy

- Use `Result` for failure and `Option` for successful absence, including in CLIs. Read the [error index](references/topics/errors.md) when changing an error boundary.
- Prefer exhaustive enums and constructible structs unless API evolution requires otherwise. Follow [checked invariants and API shape](references/design-and-concurrency.md#checked-invariants-and-api-shape), including its boundary tests.
- Use focused `thiserror` enums, not Microsoft's public error-struct default. Read [typed errors](references/typed-errors.md) for source preservation, redaction and reporting.

## Traps agents fall into here

1. **Failure as absence.** `.ok()`, `unwrap_or*`, `let _ =` and `Path::exists` erase errors. Use `Path::try_exists`; map only expected absence and propagate the rest.
2. **Branching on error text.** Match variants, fields or `io::ErrorKind`, never `to_string().contains(..)`.
3. **Erased causes.** Use `map_err(|source| Error::Op { path, source })`, not `map_err(|_| ..)`. `Result<_, String>` and `Box<dyn Error>` erase recovery below the final renderer. Show a source in `#[error]` or via `source()`, not both.
4. **JSON as a type system.** Deserialize into validated types at ingress; keep `serde_json::Value` for opaque payloads.
5. **Bool-shaped enums.** Name real states, not variants invented to pass a lint. For independent bools, apply trap 14.
6. **Per-step timeouts.** Carry one deadline through every relevant await, including shutdown; timeouts cannot preempt non-yielding work.
7. **Detached tasks.** Own a `JoinSet` or retain and await handles; observe errors and panics and define shutdown.
8. **Blocking in async.** Use async APIs or bounded blocking work; cancelling its waiter does not stop a started closure.
9. **Unbounded reads.** Enforce a byte ceiling with limit-plus-one reads; reject overflow, check length prefixes and bound queues before allocation.
10. **Publishing before validation.** Validate the whole candidate first; replace durable files by temp write, sync and rename as required.
11. **Second parsers.** Reuse the owning argv, path, config or header parser; preserve wire and platform semantics.
12. **Wildcards on owned enums.** List variants; keep fallback handling for foreign non-exhaustive types and open wire values.
13. **Accidental `pub`.** Export supported boundaries; use narrower visibility for internal consumers.
14. **Satisfying the lint, not the obligation.** Fix the model first, not with responsibility-free splits or ownership-hiding clones. When a lint's premise is false, use `#[expect(lint, reason = "<property that makes this site correct>")]` on the narrowest item; see [exception reasons](references/topics/universal.md). Panic-family lints (`unwrap_used`, `expect_used`, `panic`, indexing and slicing) follow the panic policy and its single production exception.
15. **Go-parity numerics.** In crates that depend on `numen-gomath`, keep specified operand order and call it; no reassociation, `mul_add` or libm replacement outside it.

## Load only what the task needs

Resolve links from this skill's installed directory. Start with the relevant [Google sections](references/topics/google.md), including their exceptions and platform scope; use supplementary indexes only for remaining questions. Load relevant rules, not the whole tree.

| Task | Index |
| --- | --- |
| Supplementary sources, formatting, design patterns, known `C-*` rules | [Upstream sources](references/topics/upstream.md) |
| Naming, standard conventions, static checks, logging | [Universal](references/topics/universal.md) |
| Ownership, traits/types, sync/async, scoped lifetimes and runtime choice | [Design and concurrency](references/design-and-concurrency.md) |
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

For rule-ID lookup and vendored-source maintenance, read [maintenance](references/maintenance.md).

Before done, name the applicable trap for each changed boundary or confirm none applies. Run assigned checks. Review findings name a governing rule, mechanism and consequence, not a preference.
