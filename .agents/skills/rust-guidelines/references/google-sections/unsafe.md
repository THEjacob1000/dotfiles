Google Rust Style Guide excerpt: `unsafe`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="unsafe"></a>

### Unsafe code

Don't write unsafe code unless there is no way to implement the same
functionality with safe code.

If you do have to write unsafe code:

*   Encapsulate unsafe code in a safe abstraction and isolate it from business
    logic as much as possible. Ideally, unsafe code should be in a separate
    crate with few dependencies beyond the standard library.
*   Add a safety comment starting with `SAFETY:` that explains why the code is
    correct.
*   Add a technical justification for unsafe code. Depending on context, this
    can be a justification for an individual unsafe block or a more general
    justification that covers an entire file or build target. The justification
    should answer these questions:
    *   Why is this code not written in an equivalent safe way?
    *   If the reason is performance, are there benchmarks?
