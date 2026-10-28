Google Rust Style Guide excerpt: `small-crates`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="small-crates"></a>

### Prefer small crates <span class="chrome">[chrome]</span>

Prefer small crates in Chromium; ideally, but not necessarily, a single file
(focusing on one abstraction). If your code can be split up into small crates,
do so.

A crate corresponds to a single `rust_static_library` (chrome) rule, which may
contain one or more `.rs` files.

Additional considerations:

*   The root module is allowed to `re-export` public APIs from
    `leaf submodules`, making submodules an implementation detail of the crate
    (as users don't need to know about these submodules).

*   This rule about small crates applies equally to crates with and without
    submodules. First, evaluate whether the APIs need to be in the same crate,
    and only then consider whether submodules could help organize the APIs.

*   If you decide to use submodules, follow the
    [expected file structure](structure.md#structure).

Larger crates are allowed when
[trait impl coherence rules](https://smallcultfollowing.com/babysteps/blog/2015/01/14/little-orphan-impls/)
force multiple types and traits to be included in one library, or if you're
building a large foundational library.

Rationale

Fine-grained library targets are recommended in Chromium due to the massive size
of our codebase, non-local effects of adding dependencies in the build graph,
and to improve performance of parallel compilation and build caching.
