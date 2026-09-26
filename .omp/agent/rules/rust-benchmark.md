---
description: Rust benchmark code or benchmark dependencies
condition: '(?m)(\b(criterion|divan)::|criterion_group!|#\[bench\]|\bblack_box\(|^\s*(criterion|divan)\s*=)'
scope: "tool:edit(*.rs), tool:write(*.rs), tool:edit(Cargo.toml), tool:write(Cargo.toml)"
interruptMode: never
generated-by: numen-sync
---

This edit writes or wires a benchmark. Read skill://rust-guidelines/references/rust-performance-book/src/benchmarking.md and skill://rust-guidelines/references/microsoft/src/guidelines/performance/M-HOTPATH.md, and profile the hot path with skill://rust-guidelines/references/rust-performance-book/src/profiling.md rather than trusting the timing alone.
