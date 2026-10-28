Google Rust Style Guide excerpt: `global-initialization`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="global-initialization"></a>

### Do not run code before `main()`

Do not cause code to run before `main()`, for example by using techniques such
as the [ctor crate](https://docs.rs/ctor/latest/ctor/).
