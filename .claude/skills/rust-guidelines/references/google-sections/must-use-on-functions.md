Google Rust Style Guide excerpt: `must-use-on-functions`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="must-use-on-functions"></a>

### `#[must_use]` on functions

Use `#[must_use]` on functions in these cases:

*   The caller cannot use the function correctly if they ignore the return
    value. This includes pure functions (functions without side effects), such
    as `HashMap::get()`.

*   Any function whose return value represents an error or otherwise critical
    information about the function's behavior. If the return type is already
    annotated `#[must_use]` (which is true of `Result`, for example), the
    function does not need to be annotated `#[must_use]`.
