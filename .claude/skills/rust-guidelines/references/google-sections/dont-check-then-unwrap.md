Google Rust Style Guide excerpt: `dont-check-then-unwrap`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="dont-check-then-unwrap"></a>

### Prefer pattern matching over check-then-unwrap

Avoid potentially panicking operations when the input data guarantees they
cannot panic. For example, instead of using `Option::unwrap` on a value known to
be valid, use pattern matching to prove correctness to the compiler.

<div class='goodcode'></div>

```rust
// Good: The match arm proves to the compiler that `x` is `Some`.
// A panic is obviously not possible.
if let Some(value) = option {
    use_value(value);
}
```

<div class='badcode'></div>

```rust
// Bad: Correctness of `unwrap` relies on a runtime check that `option` is `Some`.
if option.is_some() {
    use_value(option.unwrap());
}
```
