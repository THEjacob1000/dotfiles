Google Rust Style Guide excerpt: `options-should-implement-default`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="options-should-implement-default"></a>

### Options structs should implement Default

Structs with all-public fields that are primarily used as a “bag of options” for
a function should implement `Default`.

Rationale

This enables convenient use of struct update syntax
(`Struct { a: 0, ..Default::default()}` ).
