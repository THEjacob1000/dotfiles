Google Rust Style Guide excerpt: `userdefined-item`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="userdefined-item"></a>

### Name source files and leaf modules after the primary user-defined item

When a `leaf module` has a primary user-defined item (e.g., `Foo`), the module
should be named after that item (e.g., `mod foo` and `foo.rs`).

Leaf modules that are not primarily about any particular abstraction can be
named as desired.

Rationale

This makes it easy to identify the content/purpose of a source file or leaf
module at a glance.
