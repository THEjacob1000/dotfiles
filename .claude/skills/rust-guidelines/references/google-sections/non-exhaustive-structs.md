Google Rust Style Guide excerpt: `non-exhaustive-structs`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="non-exhaustive-structs"></a>

### Apply `#[non_exhaustive]` to public structs with public fields

Structs with public fields that are part of a public API used by other teams
should be marked `#[non_exhaustive]`.

Exceptions:

*   The struct fields are unlikely to change, e.g., because they describe an
    existing ontology (e.g., a Rectangle type) or the reviewer can otherwise be
    confident that they will not change.
*   The struct fields *may* change in the future, but you are committed to
    fixing resulting breakages via an LSC.
*   You want to enable your users to use functional record update (FRU) struct
    initialization syntax (`Person { name: "foo", ..Default::default() }`).

Rationale

Adding a new field (even a private one) to a struct with all public fields is a
breaking change, because callers can no longer name all fields in a struct
literal.

A `#[non_exhaustive]` struct can't be constructed with the struct literal
syntax, except for the code in the same crate. This allows new private fields to
be added without breaking users.

This rule is primarily important for structs used across team boundaries,
because the scope of the breakage could be significant. Structs used only a
small number of times can't create a large breakage and thus may ignore this
rule.
