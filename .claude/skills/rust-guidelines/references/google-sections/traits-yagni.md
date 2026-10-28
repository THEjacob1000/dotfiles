Google Rust Style Guide excerpt: `traits-yagni`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="traits-yagni"></a>

### Add trait implementations when they become necessary

As a general rule, low-level library code should anticipate users' needs
proactively, while application code should add trait impls as needed.
