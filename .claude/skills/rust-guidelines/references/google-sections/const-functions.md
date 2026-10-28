Google Rust Style Guide excerpt: `const-functions`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="const-functions"></a>

### Use `const` functions responsibly

Mark a public function as `const` only if you expect it to remain `const` in the
future (or can commit to helping clients migrate when it changes).

Rationale

It’s a breaking change to turn a `const` function into a regular function.
