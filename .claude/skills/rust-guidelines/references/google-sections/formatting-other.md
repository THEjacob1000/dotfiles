Google Rust Style Guide excerpt: `formatting-other`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="formatting-other"></a>

### Use the appropriate formatting tool

Use the appropriate formatting tool (e.g., `git cl format` in Chromium).

Configuration (for style guide authors)

A codebase may choose to not apply the following `rustfmt` options if they care
about building on stable and the option is unavailable on their stable Rust:

*   Maximum of 100 columns per line:
    [`max_width = 100`](https://rust-lang.github.io/rustfmt/?version=v1.6.0&search=#max_width)

*   Usage of lowercase alphabets in hex literals (`0xab123cdef` as opposed to
    `0xAB123CDEF`):
    [`hex_literal_case = Lower`](https://rust-lang.github.io/rustfmt/?version=v1.6.0&search=#hex_literal_case)

*   Macro matcher formatting:
    [`format_macro_matchers = true`](https://rust-lang.github.io/rustfmt/?version=v1.6.0&search=#format_macro_matchers)

*   Usage of escapes for invisible characters in literals. E.g., if you wish to
    have text containing a Zero-Width joiner, use `\u{200D}`.
