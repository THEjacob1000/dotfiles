Google Rust Style Guide excerpt: `prefer-named-fields`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="prefer-named-fields"></a>

### Prefer named fields over tuples and non-newtype tuple structs

Prefer types with named fields over tuples, as tuple indexes (`.0`, `.1`, ...)
quickly become confusing.

Exceptions:

*   Newtype tuple structs (tuple structs with only one field).
*   In very local contexts where there is unlikely to be any confusion.
