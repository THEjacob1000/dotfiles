Google Rust Style Guide excerpt: `glob-imports`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="glob-imports"></a>

### Don’t use glob imports

Don't use glob imports, except in the following situations where you may
optionally do so at your own discretion:

*   `use super::*` for inline modules
*   `use enum::*` in method bodies of enums, and functions that are primarily
    dealing with that enum
*   `pub use submodule::*` for non-leaf modules
*   C++ interop: Since the same namespace (in C++) is a submodule in different
    Rust crates (in Rust), you may merge the namespaces into a private copy
    using glob imports. For example:

    ```rust
    mod absl {
        pub use status::absl::*;
        pub use strings::absl::*;
    }
    ```

    In this hypothetical example, you can use `absl::Status` and `absl::StrCat`
    from Rust, the same way you would from C++, instead of spelling them as
    `status::absl::Status` and `strings::absl::StrCat`.

    This must only be used for merging C++ namespaces, and the resulting merged
    module must not be public.

If using third-party crates that encourage a prelude, it is up to the reviewer’s
discretion to allow it.

This also means that defining preludes should be avoided.

Rationale

Glob imports increase toil for code janitors running LSCs, and make it harder to
know where a type comes from in contexts without xrefs.
