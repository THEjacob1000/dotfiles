---
description: Rust build profile or codegen settings
condition: '(?m)(^\s*\[profile\.|^\s*(lto|codegen-units|opt-level|panic)\s*=|target-cpu)'
scope: "tool:edit(Cargo.toml), tool:write(Cargo.toml), tool:edit(config.toml), tool:write(config.toml)"
interruptMode: never
generated-by: numen-sync
---

This edit changes how Rust is compiled. Read skill://rust-guidelines/references/rust-performance-book/src/build-configuration.md, and skill://rust-guidelines/references/microsoft/src/guidelines/apps/M-TARGET-CPU.md before pinning a CPU. Measure the build you ship, and weigh any compile-time cost against skill://rust-guidelines/references/rust-performance-book/src/compile-times.md.
