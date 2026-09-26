# Bounds Checks

By default, accesses to container types such as slices and vectors involve
bounds checks in Rust. These can affect performance, e.g. within hot loops,
though less often than you might expect.

There are several safe ways to change code so that the compiler knows about
container lengths and can optimize away bounds checks.

- Prefer iterating over elements rather than indexing by a loop counter.
- When accessing multiple slices at the same index, [`zip`] can keep their
  lengths aligned without repeated bounds checks; it stops at the shorter one.
- Slice a `Vec` before a hot loop if that helps the compiler reason about its
  length.
- Assert the needed index range before entering a loop, then inspect the
  generated code to see whether checks were eliminated.
[**Example 1**](https://github.com/rust-random/rand/pull/960/commits/de9dfdd86851032d942eb583d8d438e06085867b),
[**Example 2**](https://github.com/image-rs/jpeg-decoder/pull/167/files).

Getting these to work can be tricky. The [Bounds Check Cookbook] goes into more
detail on this topic.

[Bounds Check Cookbook]: https://github.com/Shnatsel/bounds-check-cookbook/

[`zip`]: https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.zip

Only after measuring a remaining cost, consider unsafe [`get_unchecked`] or
[`get_unchecked_mut`]. The index must be in bounds on *every* execution:
an out-of-bounds index is undefined behaviour even if the returned reference
is never read. Document the invariant at the call site; debug assertions do
not make a release build safe.

[`get_unchecked`]: https://doc.rust-lang.org/std/primitive.slice.html#method.get_unchecked
[`get_unchecked_mut`]: https://doc.rust-lang.org/std/primitive.slice.html#method.get_unchecked_mut

