---
name: go-guidelines
description: Write, refactor, or review Go (Golang) using a pinned Google Go style guide. Load only the guidance relevant to the API, concurrency, error handling, or testing decision at hand.
generated-by: numen-sync
---

# Go guidelines

Use Google's Go style guide as the default design reference. User instructions and the target repository's constraints take precedence. Google's core guide takes precedence over its style decisions; best practices describe tradeoffs, not universal requirements. Apply guidance to the requested change without unrelated style churn.

## Load only what the task needs

Resolve links relative to this skill's installed directory. Pick the relevant topic, read its short index, then read only the sections needed for the decision. Start with one topic and a few sections; expand for concrete questions. Reuse guidance already in context. Don't read every index, the entire reference tree, or the original source documents by default.

| Task | Index |
| --- | --- |
| Clarity, simplicity, consistency and formatting | [Principles](references/topics/principles.md) |
| Names, receivers, packages and imports | [Naming](references/topics/naming.md) |
| Interfaces, generics, receivers, zero values and API parameters | [Types and APIs](references/topics/types.md) |
| Error contracts, wrapping, logging and panics | [Errors](references/topics/errors.md) |
| Goroutine lifetimes, channels and synchronization | [Concurrency](references/topics/concurrency.md) |
| Package structure, initialization and program organization | [Structure](references/topics/structure.md) |
| Comments, examples and public documentation | [Documentation](references/topics/docs.md) |
| Test structure, comparisons, helpers and failures | [Testing](references/topics/testing.md) |

Cross-references inside excerpts point to upstream pages. For another guideline, search the local topic indexes for its heading and read that excerpt instead of fetching a whole chapter. Normal guideline lookup works offline.

The excerpts retain Google's guidance and examples. References to Google-internal tools, packages or processes are context, not requirements for this repository. Use its existing toolchain and dependencies; don't add a dependency merely because an example imports it. Check the target module's Go version before applying version-sensitive examples or newer language features. Consult official Go documentation when language or library behavior is uncertain.

## Local invariant policy

Make the compiler enforce meaningful distinctions where Go supports them: named types, narrow interfaces, directional channels and unexported representation. Use checked constructors when validation matters, but account for zero values, explicit conversions, decoding, mutation and aliased slices or maps. Private fields alone don't prevent zero-value construction, and a named primitive doesn't force callers through its constructor. Make invalid states harmless or reject them at the operation that requires validity; don't claim Rust-style ownership or exhaustive enum checking that Go doesn't provide.

Use the repository's verification commands. For concurrency changes, exercise cancellation and shutdown and run race checks where supported; a passing race run only covers the execution it observed. In review, connect guidance to the concrete consequence and distinguish a correctness defect from a style preference.

The pinned originals, source hashes and license live in [upstream.json](references/google/upstream.json) and [LICENSE](references/google/LICENSE). Read the originals only when auditing or updating the excerpts.
