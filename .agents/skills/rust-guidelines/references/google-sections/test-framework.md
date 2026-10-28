Google Rust Style Guide excerpt: `test-framework`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="test-framework"></a>

## Use the right per-codebase test framework

Most codebases use their own specific test framework rather than `#[test]`.

*   <span class="chrome">Chrome</span> Use
    [rust_gtest_interop](https://source.chromium.org/chromium/chromium/src/+/main:testing/rust_gtest_interop/).
    This makes it possible to integrate Rust tests into C++ test binaries.

*   <span class="fuchsia">Fuchsia</span> Use `#[fuchsia::test]`. See
    [here](https://fuchsia.dev/fuchsia-src/development/languages/rust/testing.md)
    for more details.
