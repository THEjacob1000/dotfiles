Google Rust Style Guide excerpt: `non-exhaustive-enum-matching`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="non-exhaustive-enum-matching"></a>

### Don't omit patterns on `non_exhaustive` enums when matching

Prefer to list all enum variants in `match` statements over `non_exhaustive`
enums.

If you don't care about specific variants, place them in the wildcard arm. If
you *only* care about specific variants, use an `if let` or a `let … else {}`.

Examples:

```rust
#[non_exhaustive]
pub enum Shape {
    Circle,
    Square,
    Triangle,
}
```

<div class='goodcode'></div>

```rust
fn process_shape(shape: Shape) {
  match shape {
    Shape::Circle => println!("It's a circle"),
    Shape::Square => println!("It's a square"),
    // Triangle and any future variants don't require any actions.
    Shape::Triangle | _ => {}
  }
}
```

<div class='goodcode'></div>

```rust
fn process_shape(shape: Shape) {
  if let Shape::Circle = shape {
    println!("It's a circle");
  }
}
```

<div class='badcode'></div>

```rust
fn process_shape(shape: Shape) {
  match shape {
    Shape::Circle => println!("It's a circle"),
    _ => {}
  }
}
```

Exceptions:

*   You only care about specific variants *and* `match` is cleaner than
    `if let`.
