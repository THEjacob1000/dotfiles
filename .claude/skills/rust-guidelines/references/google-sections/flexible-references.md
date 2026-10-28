Google Rust Style Guide excerpt: `flexible-references`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="flexible-references"></a>

### Accept flexible references for immutable data

When functions accept borrowed, immutable data, use a reference type that
affords the most flexibility. Pass references to the data itself instead of
references to smart pointers, containers, or wrappers.

<!-- mdformat off(keep table rows on single lines for Kramdown compatibility in the public style guide) -->

| Use          | Instead of   | Why?                                                         |
| ------------ | ------------ | ------------------------------------------------------------ |
| `&T`         | `&Box<T>`    | Borrow the data inside the box                               |
| `&[T]`       | `&Vec<T>`    | Accept any slice instead of specific containers              |
| `&str`       | `&String`    | Accept a string slice instead of references to owned strings |
| `Option<&T>` | `&Option<T>` | Borrow the data inside the Option                            |

<!-- mdformat on -->

Exceptions:

*   When expecting non-linear character data such as Rope/Cord.

For context, see Clippy lints
[`borrowed_box`](https://rust-lang.github.io/rust-clippy/master/index.html#borrowed_box)
and
[ptr_arg](https://rust-lang.github.io/rust-clippy/master/index.html#ptr_arg).

Rationale

Accepting reference types that don't mention specific smart pointers,
containers, or wrappers makes functions more versatile and performant: callers
can pass data held in a variety of ways without copying it first.
