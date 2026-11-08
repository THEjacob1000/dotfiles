---
condition:
  - "**/*.rs"
  - "*.rs"
interruptMode: never
generated-by: numen-sync
---

# How to get Rust right

Use the `rust-guidelines` skill before writing, refactoring, or reviewing Rust. It routes to Google's style guide, local type/error and design policies, then compatible community and Microsoft guidance. Load individual rules as needed, not the whole handbook.

Make the compiler enforce meaningful invariants where practical, and preserve them through construction, deserialization, and mutation. Repository constraints and the user's instructions take precedence over upstream defaults.
