Google Rust Style Guide excerpt: `from-impls`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="from-impls"></a>

### Pair important `From` impls with explicit constructor methods

If a type has an important `From` impl that is expected to be one of the primary
ways of constructing it, add an inherent `::new()`, `::new_from_foo()`, or
`::from_foo()` method.
