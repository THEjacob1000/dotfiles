---
description: A Rust collection created empty and then grown in a loop
condition: '\b(Vec|String|VecDeque|HashMap|HashSet|BTreeMap|BTreeSet)::new\(\)(?:(?!\n\s*(?:pub(?:\([^)]*\))?\s+)?(?:async\s+)?fn\s)[\s\S])*?(\bfor\s+[^{;]*?\bin\b|\bwhile\b|\bloop\s*\{)(?:(?!\n\s*(?:pub(?:\([^)]*\))?\s+)?(?:async\s+)?fn\s)[\s\S])*?\.(push|push_str|push_back|insert|extend)\('
scope: "tool:edit(*.rs), tool:write(*.rs)"
interruptMode: never
generated-by: numen-sync
---

This edit grows a collection that started empty inside a loop. When the final size is known or bounded, size it up front: read skill://rust-guidelines/references/microsoft/src/guidelines/performance/M-INITIAL-CAPACITY.md and the Vec growth section of skill://rust-guidelines/references/rust-performance-book/src/heap-allocations.md. Collecting from an iterator often sizes itself.
