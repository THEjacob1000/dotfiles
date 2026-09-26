---
description: Rust code using the standard HashMap or HashSet
condition: '\b(HashMap|HashSet)\s*(<|::)'
scope: "tool:edit(*.rs), tool:write(*.rs)"
interruptMode: never
generated-by: numen-sync
---

This edit uses the standard HashMap or HashSet, which hash with SipHash. On a hot path with keys an attacker cannot choose, a faster hasher pays off: read skill://rust-guidelines/references/rust-performance-book/src/hashing.md and skill://rust-guidelines/references/microsoft/src/guidelines/performance/M-FAST-HASHER.md. Keep SipHash wherever keys come from untrusted input. Follow the hasher the crate already uses.
