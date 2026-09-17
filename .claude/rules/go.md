---
paths:
  - "**/*.go"
  - "*.go"
generated-by: numen-sync
---

# How to get Go right

Use the `go-guidelines` skill before writing, refactoring, or reviewing Go. It loads relevant sections from the pinned Google Go style guide. Read individual sections as needed, not the whole handbook.

Use types and package boundaries to enforce meaningful invariants, accounting for zero values, decoding and mutation. Repository constraints and the user's instructions take precedence over upstream defaults.
