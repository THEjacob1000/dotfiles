---
name: python-guidelines
description: Write, refactor or review Python using a pinned Google Python Style Guide. Load only the guidance relevant to naming, structure, formatting, types or the language-feature decision at hand.
generated-by: numen-sync
---

# Python guidelines

Use Google's Python Style Guide as the default style reference. User instructions and the target repository's constraints take precedence. Apply guidance to the requested change without unrelated style churn. Keep the local no-suppression policy in force where Google's examples discuss disabling lint or typing diagnostics; fix the cause or report the blocker.

## Load only what the task needs

Resolve links relative to this skill's installed directory. Pick the relevant topic, read its short index, then read only the policies needed for the decision. Each excerpt retains the policy's rationale, decisions and examples together. Reuse guidance already in context; don't load the whole guide or every index by default.

| Task | Index |
| --- | --- |
| Background, lint and consistency | [Principles](references/topics/principles.md) |
| Imports, packages, naming and entry points | [Structure and naming](references/topics/structure.md) |
| Functions, classes, defaults, decorators and language features | [Functions and classes](references/topics/functions.md) |
| Mutable state, iteration, comprehensions and expressions | [Values and iteration](references/topics/values.md) |
| Exceptions, resource handling and threading | [Errors and resources](references/topics/errors-resources.md) |
| Layout, strings and statements | [Formatting](references/topics/formatting.md) |
| Comments, docstrings and TODOs | [Documentation](references/topics/docs.md) |
| Type annotations and typing conventions | [Types](references/topics/types.md) |

Cross-references inside excerpts point to pinned upstream pages. For another policy, search the local topic indexes for its heading and read that excerpt. Normal guideline lookup works offline.

The excerpts retain Google's guidance and examples. Google-internal tools, packages and processes are context, not requirements for the target repository. Use its configured formatter, linter, type checker, dependency workflow and verification commands; don't add a tool or dependency merely because an example names it. Check supported Python versions before applying version-sensitive examples.

In review, distinguish a correctness defect from a style preference and connect the guidance to the concrete change. Use `code-golf` for simplification and proof rules, and `code-refinement` for a staged sweep.

The pinned original, source hashes and license live in [upstream.json](references/google/upstream.json) and [LICENSE](references/google/LICENSE). Read the original only when auditing or updating the excerpts.
