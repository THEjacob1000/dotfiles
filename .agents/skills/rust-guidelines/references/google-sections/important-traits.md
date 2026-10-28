Google Rust Style Guide excerpt: `important-traits`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="important-traits"></a>

### Specific guidance for important traits

*   **Types with public fields**: Consider implementing traits implemented by
    all subfields.

*   **Error types**: Implement the `Copy` trait whenever possible. `Copy` types
    are simpler to manage and propagate because they can be passed by value
    without moving ownership. An example of a case where this is not possible is
    if the error must contain non-`Copy` fields like a `String`.

*   **`Copy`**: Implement whenever it is reasonably clear that the type will
    continue to be `Copy` in the future.

*   **`Clone`**: Most types should implement `Clone` unless they represent some
    external resource.

*   **`Default`**: Implement if the type implements `new()` or otherwise has a
    default state. For context, see Clippy lint
    [`new_without_default`](https://rust-lang.github.io/rust-clippy/master/index.html#new_without_default).

*   **`PartialEq`** / **`Eq`**: If you want users to use the `==` operator,
    prefer implementing `PartialEq` over `Eq`. When you do implement `Eq`, be
    aware of the additionally required reflexivity (details:
    https://doc.rust-lang.org/std/cmp/trait.Eq.html).

*   **`PartialOrd`** / **`Ord`**: If you want users to use the `<` or `>`
    operators, prefer implementing `PartialOrd` over `Ord`. When you do
    implement `Ord`, be aware that it requires total ordering (details:
    https://doc.rust-lang.org/std/cmp/trait.Ord.html).

*   **Map keys**

    *   If you think it is likely that a type will be used as a map key or
        otherwise cached, implement `Hash` and `Eq`.
    *   If, in addition, the type has a clear total ordering, implement `Ord`
        (and any traits it needs).
