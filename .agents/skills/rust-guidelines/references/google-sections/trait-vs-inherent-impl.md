Google Rust Style Guide excerpt: `trait-vs-inherent-impl`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="trait-vs-inherent-impl"></a>

### When to define a trait versus an inherent implementation

Define a trait only for the following purposes:

*   To enable generic programming (to use `T: Trait` in constraints of generic
    functions and types).

*   To accept or return an `impl Trait` or `dyn Trait`.

*   To define an [extension trait](extension-traits.md#extension-traits) (but see also the caveats
    in the section on extension traits).

In all other cases where you want to implement functionality for a type, use an
[inherent implementation](https://doc.rust-lang.org/std/keyword.impl.html#inherent-implementations).

Don't use traits merely to organize code.
