Google Rust Style Guide excerpt: `known-traits`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="known-traits"></a>

### Implement known standard library traits instead of custom methods

If a method matches the purpose and behavior of a standard library trait,
implement that trait. For example, instead of writing
`fn from_str(&str) -> Self` on `Foo`, you should `impl FromStr for Foo`.

It is acceptable to have both the method and the trait impl for discoverability
reasons.

For context, see Clippy lint
[`should_implement_trait`](https://rust-lang.github.io/rust-clippy/master/index.html#should_implement_trait)
([list of traits](https://github.com/rust-lang/rust-clippy/blob/928349795f9f28f54e69bd0f0ffeed33de5e272a/clippy_lints/src/methods/mod.rs#L3940-L3971)).
