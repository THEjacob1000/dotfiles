Google Rust Style Guide excerpt: `non-exhaustive-enums`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="non-exhaustive-enums"></a>

### Apply `#[non_exhaustive]` to publicly-exposed enums

If an enum is part of a public API used by other teams, mark it
`#[non_exhaustive]`.

Exceptions:

*   The enum will never change. For example:
    *   Enums describing an existing ontology (e.g.,
        `enum Color { Red, Green, Blue }`).
    *   Enums with two states that could be Booleans (e.g.,
        `enum Visibility { Visible, Hidden }`)
*   The enum *may* change in the future, but you are committed to fixing
    resulting breakages via an LSC.

For context, see Clippy lint
[`exhaustive_enums`](https://rust-lang.github.io/rust-clippy/master/index.html#exhaustive_enums).

Rationale

Marking an enum `#[non_exhaustive]` forces users to include a wildcard arm
(`_ => ...`) in `match` statements. This ensures code continues to compile when
new variants are added to the enum later.

This rule is primarily important for enums used across team boundaries, because
the scope of the breakage could be significant. Enums used only a small number
of times can't create a large breakage and thus may ignore this rule.
