Google Rust Style Guide excerpt: `expected-api-sets`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="expected-api-sets"></a>

### Implement expected API sets together

If you implement `len()`, also implement `is_empty()`. For context, see Clippy
lint
[`len_without_is_empty`](https://rust-lang.github.io/rust-clippy/master/index.html#len_without_is_empty).
