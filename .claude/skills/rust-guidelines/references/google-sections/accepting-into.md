Google Rust Style Guide excerpt: `accepting-into`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="accepting-into"></a>

### Accepting `Into`

When designing library APIs that accept a `T` but users are likely to have
various types, consider accepting `impl Into<T>` instead of `T` if **call-site
ergonomics are paramount**.

Tip: This should be balanced against code bloat concerns; it is not a
requirement to use lots of `Into<T>` in your code.

Note: Application code should almost never use `impl Into<T>` parameters.

Rationale

Using `impl Into<T>` allows a function to directly accept various arguments of
various compatible types. For example, a function accepting `impl Into<String>`
could be called with a `String` or a `&str` literal directly.

The tradeoff here is balancing the convenience of avoiding a `.into()` at the
callsite against the cost of generics (more complex API signature, increased
code size, sometimes even type inference difficulties).
