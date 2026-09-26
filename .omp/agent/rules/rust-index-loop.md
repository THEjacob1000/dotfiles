---
description: A Rust loop that indexes by position
astCondition:
  - "for $I in 0..$E.len() { $$$B }"
scope: "tool:edit(*.rs), tool:write(*.rs)"
interruptMode: never
generated-by: numen-sync
---

This edit loops over indices into a slice. Iterating the slice, or zipping slices, usually removes the bounds check and reads more clearly: read skill://rust-guidelines/references/rust-performance-book/src/iterators.md and skill://rust-guidelines/references/rust-performance-book/src/bounds-checks.md.
