Google Rust Style Guide excerpt: `accept-iterators`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="accept-iterators"></a>

### Iterators vs. slices in function parameters

Highly reusable library code should accept iterators or `impl IntoIterator` if
it only needs to iterate over the input.

Note: In application code, accepting a slice `&[T]` is fine if it simplifies the
code and if flexibility and performance advantages of iterators are not clearly
needed.

Rationale

Highly reusable library code generally should strive to provide more flexible
and performant APIs. Functions that accept iterators offer callers:

*   More flexibility (data can be supplied from any collection)
*   Efficiency (data does not need to be copied into a contiguous piece of
    memory)
*   Composability (the function works better with iterator chains)

In application code, the usage patterns for a function are often easier to
predict. If it is clear that performance is not a concern, or that callers would
always have a vector anyway, accepting a slice makes for a simpler API.
