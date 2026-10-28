Google Rust Style Guide excerpt: `toplevel-functions`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="toplevel-functions"></a>

### Qualify calls to top-level functions with a module name

To use top-level functions defined in other modules or crates, import their
module and call them with `modulename::functionname()`. For example:

<div class='goodcode'></div>

```rust
use std::mem;

let x = mem::transmute(y);
```

<div class='badcode'></div>

```rust
use std::mem::transmute;

let x = transmute(y);
```

Exceptions:

*   When importing functions with sufficiently disambiguated names, e.g.,
    functions from C++ (where it is typical to call top-level (free) functions
    directly).
*   In Chromium, when importing functions from
    [small, single-purpose first-party crates](small-crates.md#small-crates).

*   When the module name itself is prone to collisions. For example, when the
    module name is a C++ namespace name, and multiple crates define the same
    submodules.

Rationale

Many Rust codebases consistently keep a style such that unqualified lowercase
names are assumed local, so `foo()` can be assumed to be from the same module.
This rule largely exists to avoid reviewer disagreements, the benefit is mostly
consistency and a minor edge on reading code without xrefs.
