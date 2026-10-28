Google Rust Style Guide excerpt: `generics-vs-dyn-trait`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="generics-vs-dyn-trait"></a>

### Generics versus `dyn Trait`

In libraries, prefer accepting generics (`T: Trait` or `impl Trait`) in function
parameters over `dyn Trait`.

Exceptions:

*   Cases where code size matters.

Rationale

-   Efficiency

    -   Additional indirection: Creating a `dyn Trait` requires setting up a fat
        pointer, and a vtable lookup is required for every call of a function on
        the trait.
    -   If a function takes a `dyn Trait`, the compiler can't perform certain
        optimizations that it could if the function was generic, such as
        inlining calls to functions of the trait.

-   Some traits are not
    [`dyn` compatible](https://doc.rust-lang.org/reference/items/traits.html#dyn-compatibility).
    For example, a trait is not `dyn` compatible if it has generic functions,
    associated functions without a `self` parameter, or functions that return
    `Self`.
