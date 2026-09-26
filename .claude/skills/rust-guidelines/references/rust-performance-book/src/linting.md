# Linting

[Clippy] is a collection of lints to catch common mistakes in Rust code. It is
an excellent tool to run on Rust code in general. It can also help with
performance, because a number of the lints relate to code patterns that can
cause sub-optimal performance.

Run Clippy before manually investigating performance; its default lints
already detect a number of common inefficiencies.

## Basics

[Clippy]: https://github.com/rust-lang/rust-clippy

Once installed, it is easy to run:
```text
cargo clippy
```
The full list of performance lints appears in the [lint list] under "Perf".
The `clippy::perf` group is included in the default `clippy::all` group.

[lint list]: https://rust-lang.github.io/rust-clippy/master/

As well as making the code faster, the performance lint suggestions usually
result in code that is simpler and more idiomatic, so they are worth following
even for code that is not executed frequently.

Conversely, some non-performance lint suggestions can improve performance. For
example, the [`ptr_arg`] style lint suggests changing various container
arguments to slices, such as changing `&mut Vec<T>` arguments to `&mut [T]`.
The primary motivation here is that a slice gives a more flexible API, but it
may also result in faster code due to less indirection and better optimization
opportunities for the compiler.
[**Example**](https://github.com/fschutt/fastblur/pull/3/files).

[`ptr_arg`]: https://rust-lang.github.io/rust-clippy/master/index.html#ptr_arg

## Disallowing Types

Some standard library types can be replaced with alternatives that perform
better on particular workloads. A lint can guard a deliberate choice.

Clippy's [`disallowed_types`] lint reads a `disallowed-types` list from
`clippy.toml` at the project root. For example, to prohibit the standard hash
tables when choosing different hashers (see [Hashing]), add:
```toml
disallowed-types = ["std::collections::HashMap", "std::collections::HashSet"]
```

[Hashing]: hashing.md
[`disallowed_types`]: https://rust-lang.github.io/rust-clippy/master/index.html#disallowed_types
