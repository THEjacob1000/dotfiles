Google Rust Style Guide excerpt: `expect-over-unwrap`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="expect-over-unwrap"></a>

### Prefer `expect` over `unwrap`

If a panic is necessary because an invariant cannot be expressed in the type
system, prefer `expect` over `unwrap` to document the reason.
