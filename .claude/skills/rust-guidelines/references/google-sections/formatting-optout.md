Google Rust Style Guide excerpt: `formatting-optout`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="formatting-optout"></a>

### Opting out of automatic formatting

You may opt out of automatic formatting using `#[rustfmt::skip]`, but only in
the following situations:

*   **Manual alignment** – If you have a situation-specific reason to have a
    snippet of code line up in a particular way (e.g., multiple similar lines of
    code that you want to remain aligned for readability, or a
    matrix-constructing function).
*   **Generated code** (ideally, use a genrule instead).

Important: Formatting should not be skipped for personal style choices.
