Google Rust Style Guide excerpt: `must-use-on-types`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="must-use-on-types"></a>

### `#[must_use]` on types

Use `#[must_use]` on types intended to be returned by functions that would
otherwise be annotated `#[must_use]` according to the
[rules above](must-use-on-functions.md#must-use-on-functions).

Examples:

*   The type is an error type (similar to `Result` or `StatusOr`).

*   The type represents a lazily evaluated computation. In other words, the
    function call doesn't do anything by itself, and the return value needs to
    be accessed to cause some desired side effect.
