Google Rust Style Guide excerpt: `prefer-format-or-write`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="prefer-format-or-write"></a>

### Prefer `format!` / `write!` for concatenation and substitution

Prefer `format!()` and `write!()` to other alternatives in the following
situations:

*   To concatenate more than two strings. For example, use
    `format!("{a}{b}{c}")` instead of `a + b + c`.
*   To perform substitutions on a literal string (instead of using
    `str::replace`).

Rationale

*   `format!` / `write!` require fewer allocations than concatenating strings
    using `+`.
*   Prefer standard format strings to inventing your own templating syntax.
