Google Rust Style Guide excerpt: `extension-traits`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="extension-traits"></a>

### Extension traits

An
[extension trait](https://rust-lang.github.io/rfcs/0445-extension-trait-conventions.html)
is a trait that adds methods to a type from a different crate.

What differentiates an extension trait from other traits is that its sole
purpose is to add methods to the type; it is not intended for use in generics
(`T: Trait`, `impl Trait`) or dynamic dispatch (`dyn Trait`). To indicate this,
the name of an extension trait should carry the suffix `~Ext` (for example,
`ForeignTypeExt`).

In general, the team that owns the original type should also own the extension
trait.

Exceptions:

*   Extension methods that are expected to become well known and provide
    significant value, for example, in foundational libraries / frameworks.

Note: This rule is specifically about extension traits. It is relatively common
to define a trait as an input trait (e.g., `DateLike`) and implement it on a
bunch of foreign types.

Examples

```rust
extern crate foreign_crate;
use foreign_crate::ForeignType;

trait ForeignTypeExt {
  fn additional_method(&self);
}

impl ForeignTypeExt for ForeignType {
  fn additional_method(&self) { ... }
}
```

It is also possible to define an extension trait for every type that implements
some foreign trait. Effectively, this is equivalent to adding default methods to
the foreign trait:

```rust
extern crate foreign_crate;
use foreign_crate::ForeignTrait;

trait ForeignTraitExt {
  fn additional_method(&self);
}

impl<T: ForeignTrait> ForeignTraitExt for T {
  fn additional_method(&self) { ... }
}
```

Rationale

When the same team owns the extension trait and the type being extended, this
helps avoid method name conflicts between the base type and the extension trait
or between two extension traits.
