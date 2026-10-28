Google Rust Style Guide excerpt: `writing-doc`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="writing-doc"></a>

## When and how to write documentation

Add documentation comments to public APIs, potentially using the `missing_docs`
lint to help with this.

Best practices for documentation comments:

*   Consider including examples: It is not necessary for every function to have
    examples, but enough functionality should be covered in examples *somewhere*
    to give an idea of how the crate works.

*   Always document panic cases for functions which may panic due to malformed
    input.

*   Clearly document invariants for unsafe functions and traits.

*   Use capitalization and punctuation.

*   Don't explain the basics of the programming language. For example, don’t do
    the following:

    ```rust
    struct MockFileSystem { ... }

    /// A mock implementation of the FileSystem trait, intended to be used in unit tests.
    impl FileSystem for MockFileSystem
    ```

Exceptions:

*   Comments should say something that the code does not already say. If there's
    nothing insightful to say, it is better to omit the comment than to repeat
    the function name in a trivial way. For example, don’t do the following
    (it’s fine to `allow` the lint in that case):

    ```rust
    /// Removes an element.
    pub fn remove_element() -> Element {}
    ```

*   It is generally okay to omit documentation on individual enum variants,
    especially if their name is self-explanatory.

**How to format documentation comments**

Follow these guidelines when writing documentation comments:

*   Use `///` comments to document items following the comment, such as
    functions, structs, enums, traits, and type aliases.
*   Use `//!` comments to document the module or the library itself. These
    comments should be placed at the top of the file.
*   Follow the rules laid out in
    [the official Rust style guide on doc comments](https://doc.rust-lang.org/nightly/style-guide/#doc-comments).
*   Use Markdown syntax.
*   Use ordinary comment syntax (`//`) for non-documentation comments, such as
    implementation comments, TODOs that are not interesting for users, commented
    out source code, etc.
*   Prefer to document things in a straightforward manner, using `///` and `//!`
    comments, rather than generating documentation from macros. This makes the
    documentation directly readable when viewing or modifying the source code.

It is acceptable, and even encouraged, to mix doc comments (`///` and `//!`) and
ordinary comments (`//`). If you have one thing you wish to document publicly,
and another thing you want to note as an implementation comment, then use both!
For example:

<div class='goodcode'></div>

```rust
/// Finds the first `FooItem` with the given `name`, or `None` if not present.
// TODO: crbug.com/12345 - `name` should be &str, not String.
pub fn get_named(items: &[FooItem], name: String) -> Option<&FooItem> {...}
```

Rationale

Many, though not all, languages have a different commenting convention (such as
extra `*` characters) for doc comments as opposed to implementation comments.
Rust and Python are notable for not just having different commenting
conventions, but an actual different syntax entirely. This has concrete benefits
to the Rust ecosystem:

*   Doc comments can be consumed by tooling, including documentation generators
    like `rustdoc`, IDE features, and Kythe.
*   Doc comments have a standard structure and formatting rules (Markdown),
    allowing for rich text in those contexts.
*   Errors in applying doc comment syntax (e.g., applying it to an expression
    instead of a documentable item) are linted against, catching documentation
    errors early. If there are no lint errors, the doc comments are guaranteed
    to be visible to documentation tooling, removing a degree of flakiness and
    unpredictability from the documentation process.
*   Doc comments are a part of the AST, and so can be produced and consumed by
    macros, including both `macro_rules!` macros and procedural macros.
