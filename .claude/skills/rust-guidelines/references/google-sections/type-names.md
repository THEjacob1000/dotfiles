Google Rust Style Guide excerpt: `type-names`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="type-names"></a>

### Type names should be imported and used unqualified

By default, types and traits should be referenced in code without using their
module path, e.g., code should use `Regex`, not `regex::Regex`, with a
`use regex::Regex` at the top of the file or potentially in the relevant
function.

Exceptions:

*   In cases where there are ambiguities, it is acceptable to directly reference
    types with common names like `io::Error`. It is also acceptable to rename
    (`use std::io::Error as IoError`).
*   In cases where you have a large “group” of types, e.g. the
    [`hir module in rustc`](https://doc.rust-lang.org/nightly/nightly-rustc/rustc_hir/hir/index.html)
    which contains a large number of HIR types.
*   In macros and generated code; where requiring a `use` is counterproductive.
*   In code with lots of dependencies, where importing everything would lead to
    a very large import block with little benefit.

Rationale

This rule largely exists to avoid reviewer disagreements.
