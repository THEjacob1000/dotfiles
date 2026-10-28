Google Rust Style Guide excerpt: `doc-hidden`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="doc-hidden"></a>

### Do not access items marked `#[doc(hidden)]` that you don't own

Treat items marked `#[doc(hidden)]` as private. Don't access them unless you own
the code.
