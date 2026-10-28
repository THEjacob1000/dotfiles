Google Rust Style Guide excerpt: `unstable-features`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="unstable-features"></a>

### No unstable features

Don't use unstable features.

Exceptions:

*   <span class="android">Android</span> Embedded programming may require the
    use of certain unstable features. While review will be required to enable
    them (to help search for alternatives), features absolutely required to
    build an artifact correctly will generally be approved.
*   <span class="chrome">Chrome</span> Style arbiters may blanket-approve a
    small list of features for the entire codebase. Typically, only features
    that have a clear path to stabilization will be approved.
*   <span class="fuchsia">Fuchsia</span> See guidance
    [here](https://fuchsia.dev/fuchsia-src/development/languages/rust/unstable).
