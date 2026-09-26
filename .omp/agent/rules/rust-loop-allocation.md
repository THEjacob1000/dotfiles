---
description: Allocation inside a Rust loop body
condition: '(\bfor\s+[^{;]*?\bin\b[^{;]*|\bwhile\b[^{;]*|\bloop\s*)\{(?:(?!\n\s*(?:pub(?:\([^)]*\))?\s+)?(?:async\s+)?fn\s)[\s\S])*?(\.clone\(\)|\.to_string\(\)|\.to_owned\(\)|\bformat!\(|\bvec!\[|\b(Vec|String|Box)::new\()'
scope: "tool:edit(*.rs), tool:write(*.rs)"
interruptMode: never
generated-by: numen-sync
---

This edit allocates inside a loop body. If the loop runs per item, per request or per message, read skill://rust-guidelines/references/rust-performance-book/src/heap-allocations.md and skill://rust-guidelines/references/microsoft/src/guidelines/performance/M-MEM-REUSE.md, then hoist, borrow or reuse the allocation. A loop that runs a few times at startup needs nothing.
