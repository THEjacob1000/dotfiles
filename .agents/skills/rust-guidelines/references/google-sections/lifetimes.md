Google Rust Style Guide excerpt: `lifetimes`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="lifetimes"></a>

### Naming lifetimes

Lifetimes should have descriptive names, especially type lifetimes.

Exceptions:

*   Type lifetimes that are extremely generic abstractions like `Cow`.
*   It is fine to use anonymous lifetimes (`'_`) where they work.
*   Single-character lifetimes are okay when they are simply expressing the
    relationship between a method’s input and output, or needed for a local
    higher-ranked lifetime bounds (`for<'a>`). Up to two such local lifetimes
    are fine, if more are needed, we strongly advise you to use descriptive
    names.
