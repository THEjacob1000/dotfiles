Google Rust Style Guide excerpt: `type-inference`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="type-inference"></a>

### Don't overuse type inference

Add enough explicit types so that someone familiar with the codebase can figure
out what the inferred types are.

Prefer to add the types to variable declarations, rather than as
[turbofishes](https://doc.rust-lang.org/reference/glossary.html#turbofish). If
the compiler forces you to add a turbofish, it is generally fine to add a `_`
inference marker.

Specific situations in which you should probably add types:

*   When calling methods with a generic return type, such as `.into()` or
    `.parse()`.
*   For the result of complex iterator chains.
