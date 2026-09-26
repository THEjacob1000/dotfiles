# Wrapper Types

Rust has a variety of "wrapper" types, such as [`RefCell`] and [`Mutex`], that
provide special behavior for values. Accessing these values can take a
non-trivial amount of time. If multiple such values are typically accessed
together, it may be better to put them within a single wrapper.

[`RefCell`]: https://doc.rust-lang.org/std/cell/struct.RefCell.html
[`Mutex`]: https://doc.rust-lang.org/std/sync/struct.Mutex.html

For example, a struct like this:
```rust
# use std::sync::{Arc, Mutex};
struct S {
    x: Arc<Mutex<u32>>,
    y: Arc<Mutex<u32>>,
}
```
may be better represented like this:
```rust
# use std::sync::{Arc, Mutex};
struct S {
    xy: Arc<Mutex<(u32, u32)>>,
}
```
This can reduce reference-count and lock operations when `x` and `y` are
usually used together. It also makes access to either field contend on the
same lock, so keep separate wrappers when the fields are often accessed
independently. Measure with representative contention.
