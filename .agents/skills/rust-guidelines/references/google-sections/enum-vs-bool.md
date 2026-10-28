Google Rust Style Guide excerpt: `enum-vs-bool`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="enum-vs-bool"></a>

### Prefer `enum` over `bool` in APIs

Use `enum` function parameters instead of `bool` in cases where the purpose of
the parameter is not obvious.

If you do use `bool`, consider using an inline comment to document the purpose
of the `bool` in an argument list.
