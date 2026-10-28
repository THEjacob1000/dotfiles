Google Rust Style Guide excerpt: `structure`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="structure"></a>

### Use flat file layout for `rust_library` sources <span class="chrome">[chrome]</span>

In Chromium `.rs` source files belonging to one `rust_library` (one Rust crate)
must reside in a single directory.

Don't use subdirectories to organize files that belong to a single crate. If
organizing one crate's files into subdirectories feels necessary, this is a
strong indication that the crate has grown [too large](small-crates.md#small-crates) and should
be split.

This crate layout is intentionally different from the conventional Cargo
directory structure typically used in open-source repositories.

Exception: Rust code in `//third_party` that is also built with
[Cargo](https://doc.rust-lang.org/cargo/) should follow the conventional Cargo
directory structure.

Rationale

The approach in Chromium is driven by the following factors:

*   Based on the preference for [small crates](small-crates.md#small-crates), most
    `rust_library` targets will only contain one source file.
*   Because of the above point, creating a directory for each `rust_library`
    target would result in most directories containing only one source file.
*   Multi-file `rust_library` targets should not create dedicated directories
    for submodules either; this ensures a consistent approach.
