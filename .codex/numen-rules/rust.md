---
paths:
  - "**/*.rs"
  - "*.rs"
generated-by: numen-sync
---

# How to get Rust right

Use the `rust-guidelines` skill before writing, refactoring, or reviewing Rust. It routes to Google's style guide, local type/error and design policies, then compatible community and Microsoft guidance. Load individual rules as needed, not the whole handbook.

Check the skill's numbered "Traps agents fall into here" section, especially:

- **Absence:** distinguish supported absence from failure; propagate actionable errors instead of hiding them in defaults.
- **Typed errors:** preserve recovery distinctions and sources below the final reporting boundary; do not branch on error text.
- **Tasks:** retain an owner that observes completion, failure and shutdown; do not detach spawned work.
- **Bounded input:** enforce a byte ceiling while reading, before allocating or parsing the whole value.

Make the compiler enforce meaningful invariants through construction, deserialization and mutation. Repository constraints and the user's instructions take precedence over upstream defaults.
