Google Rust Style Guide excerpt: `non-leaf-modules`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="non-leaf-modules"></a>

### Don’t implement APIs in non-leaf modules

The only items in non-leaf modules should be module declarations (not
definitions) and `re-exports`.

Note that the definition of `leaf modules` allows the following sub-modules:
`mod test` and cross-language binding modules like `#[cxx::bridge]`.

Exceptions:

*   Having a small amount of core “ties things together” implementation code in
    a non-leaf module may be fine. The goal is to not have a lot of code in
    these modules.

Rationale

This makes it easier to find things, and avoids mixing structure and contents.
