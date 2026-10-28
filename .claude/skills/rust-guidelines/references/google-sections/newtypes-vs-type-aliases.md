Google Rust Style Guide excerpt: `newtypes-vs-type-aliases`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="newtypes-vs-type-aliases"></a>

### Newtypes versus type aliases

Use a
[newtype](https://doc.rust-lang.org/rust-by-example/generics/new_types.html)
instead of a type alias in the following cases:

*   If the type you are defining has notable semantic differences.
*   For types that warrant an API of their own.
*   If you want the flexibility to change the underlying type later, especially
    if you don't control all usages of your type.
*   For type safety, if it’s easy for the types to get mixed up. For example, a
    `Date` type may use newtypes to distinguish `Day`, `Month`, and `Year`
    numbers in its internal calculations.
