Google Rust Style Guide excerpt: `naming-methods`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="naming-methods"></a>

### Naming methods

Follow the Rust standard library style for naming methods. See also the guidance
on
[naming conventions](https://google.github.io/comprehensive-rust/idiomatic/foundations-api-design/predictable-api/naming-conventions.html)
in the Comprehensive Rust course.

Specific considerations:

*   Use prefixes such as `as_...()`, `to_...()`, or `into_...()` with the
    appropriate `self` convention. See also
    [this section](https://rust-lang.github.io/api-guidelines/naming.html#ad-hoc-conversions-follow-as_-to_-into_-conventions-c-conv)
    of the Rust API Guidelines and the Clippy lint
    [`wrong_self_convention`](https://rust-lang.github.io/rust-clippy/master/index.html#wrong_self_convention).
