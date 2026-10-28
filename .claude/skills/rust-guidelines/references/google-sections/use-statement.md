Google Rust Style Guide excerpt: `use-statement`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="use-statement"></a>

### A `use` statement should import items from one module

This rule corresponds to the rustfmt setting `imports_granularity = Module`.

Basically, there should not be any `::`'s inside the `{..}` block of a `use`
statement. For example:

<div class='goodcode'></div>

```rust
use foo::Foo;
use foo::bar::Bar;
use foo::bar::Baz;
```

<div class='goodcode'></div>

```rust
use foo::Foo;
use foo::bar::{Bar, Baz};
```

<div class='badcode'></div>

```rust
use foo::{Foo, bar::Bar};
```
