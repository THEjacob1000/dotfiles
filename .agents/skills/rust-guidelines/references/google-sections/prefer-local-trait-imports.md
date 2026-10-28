Google Rust Style Guide excerpt: `prefer-local-trait-imports`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="prefer-local-trait-imports"></a>

### Prefer locally-scoped trait imports

Import traits within function bodies, unless the trait's methods are used
extensively throughout the file.

<div class='goodcode'></div>

```rust
fn foo(s: &str) -> Result<u8, std::num::ParseIntError> {
    // Import the trait within a function, not at the module scope.
    use std::str::FromStr;

    u8::from_str(s)
}
```
