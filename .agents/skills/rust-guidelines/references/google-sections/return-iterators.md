Google Rust Style Guide excerpt: `return-iterators`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="return-iterators"></a>

### Iterators vs. owned collections in return types

Prefer returning iterators (either concrete types or `impl Iterator`) where
possible over returning `Vec<T>`.

Note: In application code, returning a `Vec<T>` is fine if it simplifies the
code and if flexibility and performance advantages of iterators are not clearly
needed.

Exceptions:

*   Most callers will need to construct an owned vector.
*   The function's implementation naturally constructs a vector.
*   The returned value will likely need to be randomly indexed.
*   The algorithm works better as a `for` loop and the forced allocation doesn't
    matter too much.
*   The function's intended purpose is creating a new owned collection.
*   The function is returning a pre-existing vector.

Rationale

Highly reusable library code generally should strive to provide more flexible
and performant APIs. Returning an iterator allows callers to choose how to
consume the data: collect it into a vector, process it in a loop, or chain
further iterator adapters. Some of these options allow users to avoid
unnecessary allocations.

In application code, the usage patterns for a function are often easier to
predict. If it is clear that performance is not a concern, or that data would be
collected into a vector anyway, returning a vector makes for a simpler API.
