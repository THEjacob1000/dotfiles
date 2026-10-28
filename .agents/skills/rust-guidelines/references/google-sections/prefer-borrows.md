Google Rust Style Guide excerpt: `prefer-borrows`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="prefer-borrows"></a>

### Prefer borrows over deep copies

Use `.clone()` when you genuinely need a deep copy of an object.

Avoid using `.clone()` as a substitute for borrowing. Design code that works
naturally with Rust's ownership and borrowing rules. However, if the borrowing
relationships become excessively complex, `.clone()` can be a pragmatic choice.

Consider the performance needs of the code while choosing between cloning and
borrowing.

Note: This advice does not apply to cloning `Rc` or `Arc` pointers. Cloning
reference-counted pointers does not create a deep copy, and is an expected way
to use them.

Rationale

Deep copies can be expensive to make due to memory allocation and data copying.
