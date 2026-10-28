Google Rust Style Guide excerpt: `poison`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="poison"></a>

### Handling poison

Never reach inside a poisoned mutex to get at its insides, no matter how
tempting the use case may seem.
