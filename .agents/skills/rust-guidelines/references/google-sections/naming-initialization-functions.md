Google Rust Style Guide excerpt: `naming-initialization-functions`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="naming-initialization-functions"></a>

### Naming initialization functions

Follow these guidelines when naming initialization functions:

*   Constructors: Use `new()`, or `new_with_foo()` if there is more than one. If
    the constructor returns a `Result`, use `try_new()`.

*   Value-to-value conversions: Use `from_foo()` with an associated `From` impl.
    See
    [here](https://doc.rust-lang.org/std/convert/trait.From.html#when-to-implement-from)
    for details on when an operation can be considered to be a value-to-value
    conversion.
