# Type Sizes

Shrinking oft-instantiated types can help performance.

For example, if memory usage is high, a heap profiler like [DHAT] can
identify hot allocation points. Shrinking the types allocated there can
reduce peak memory usage and memory traffic.

[DHAT]: https://www.valgrind.org/docs/manual/dh-manual.html

Large types can also make copies expensive. If `memcpy` or `memmove` is hot,
DHAT's `--mode=copy` can identify copy sites. Whether a move is emitted as
inline instructions or a library call depends on the target and optimizer;
there is no fixed 128-byte threshold to design around.

## Measuring Type Sizes

[`std::mem::size_of`] gives the size of a type, in bytes, but often you want to
know the exact layout as well. For example, an enum might be surprisingly large
due to a single outsized variant.

[`std::mem::size_of`]: https://doc.rust-lang.org/std/mem/fn.size_of.html

The nightly-only `-Zprint-type-sizes` rustc flag prints layout details for
types used in a compilation. One invocation through Cargo is:
```text
RUSTFLAGS=-Zprint-type-sizes cargo +nightly build --release -j1
```
Use `-j1` if piping the output to [top-type-sizes] so concurrent compiler
output cannot interleave. For a single source file:
```text
rustc +nightly -Zprint-type-sizes input.rs
```
The output includes size, layout, and alignment. For example, for this type:
```rust
enum E {
    A,
    B(i32),
    C(u64, u8, u64, u8),
    D(Vec<u32>),
}
```
it prints the following, plus information about a few built-in types.
```text
print-type-size type: `E`: 32 bytes, alignment: 8 bytes
print-type-size     discriminant: 1 bytes
print-type-size     variant `D`: 31 bytes
print-type-size         padding: 7 bytes
print-type-size         field `.0`: 24 bytes, alignment: 8 bytes
print-type-size     variant `C`: 23 bytes
print-type-size         field `.1`: 1 bytes
print-type-size         field `.3`: 1 bytes
print-type-size         padding: 5 bytes
print-type-size         field `.0`: 8 bytes, alignment: 8 bytes
print-type-size         field `.2`: 8 bytes
print-type-size     variant `B`: 7 bytes
print-type-size         padding: 3 bytes
print-type-size         field `.0`: 4 bytes, alignment: 4 bytes
print-type-size     variant `A`: 0 bytes
```
The output shows the following.
- The size and alignment of the type.
- For enums, the size of the discriminant.
- For enums, the size of each variant (sorted from largest to smallest).
- The size, alignment, and ordering of all fields. (The compiler has
  reordered variant `C`'s fields to reduce padding.)
- The size and location of all padding.

Alternatively, the [top-type-sizes] crate can be used to display the output in
a more compact form.

[top-type-sizes]: https://crates.io/crates/top-type-sizes

Once you know the layout of a hot type, there are multiple ways to shrink it.

## Field Ordering

With the default Rust representation, the compiler may reorder fields to
reduce padding; it does not promise minimal size or a stable layout. Check
the actual size before changing a hot type. `#[repr(C)]` preserves declaration
order, so manually reordering its fields can reduce padding.

## Smaller Enums

If an enum has an outsized variant, consider boxing one or more fields. For
example, you could change this type:
```rust
type LargeType = [u8; 100];
enum A {
    X,
    Y(i32),
    Z(i32, LargeType),
}
```
to this:
```rust
# type LargeType = [u8; 100];
enum A {
    X,
    Y(i32),
    Z(Box<(i32, LargeType)>),
}
```
This reduces the type size at the cost of requiring an extra heap allocation
for the `A::Z` variant. This is more likely to be a net performance win if the
`A::Z` variant is relatively rare. The `Box` will also make `A::Z` slightly
less ergonomic to use, especially in `match` patterns.
[**Example 1**](https://github.com/rust-lang/rust/pull/37445/commits/a920e355ea837a950b484b5791051337cd371f5d),
[**Example 2**](https://github.com/rust-lang/rust/pull/55346/commits/38d9277a77e982e49df07725b62b21c423b6428e),
[**Example 3**](https://github.com/rust-lang/rust/pull/64302/commits/b972ac818c98373b6d045956b049dc34932c41be),
[**Example 4**](https://github.com/rust-lang/rust/pull/64374/commits/2fcd870711ce267c79408ec631f7eba8e0afcdf6),
[**Example 5**](https://github.com/rust-lang/rust/pull/64394/commits/7f0637da5144c7435e88ea3805021882f077d50c),
[**Example 6**](https://github.com/rust-lang/rust/pull/71942/commits/27ae2f0d60d9201133e1f9ec7a04c05c8e55e665).

## Smaller Integers

It is often possible to shrink types by using smaller integer types. For
example, indices may fit in `u32` or `u16` rather than `usize`; check their
range before converting to `usize` at use sites.
[**Example 1**](https://github.com/rust-lang/rust/pull/49993/commits/4d34bfd00a57f8a8bdb60ec3f908c5d4256f8a9a),
[**Example 2**](https://github.com/rust-lang/rust/pull/50981/commits/8d0fad5d3832c6c1f14542ea0be038274e454524).

## Boxed Slices

Rust vectors contain three words: a length, a capacity, and a pointer. If you
have a vector that is unlikely to be changed in the future, you can convert it
to a *boxed slice* with [`Vec::into_boxed_slice`]. A boxed slice contains only
two words, a length and a pointer. Any excess element capacity is dropped,
which may cause a reallocation.
```rust
# use std::mem::{size_of, size_of_val};
let v: Vec<u32> = vec![1, 2, 3];
assert_eq!(size_of_val(&v), 3 * size_of::<usize>());

let bs: Box<[u32]> = v.into_boxed_slice();
assert_eq!(size_of_val(&bs), 2 * size_of::<usize>());
```
Alternatively, a boxed slice can be constructed from an iterator with
[`Iterator::collect`]; measure whether this avoids a reallocation for your
iterator.
```rust
let bs: Box<[u32]> = (1..3).collect();
```
A boxed slice can be converted to a vector with [`slice::into_vec`] without any
cloning or reallocation.

[`Vec::into_boxed_slice`]: https://doc.rust-lang.org/std/vec/struct.Vec.html#method.into_boxed_slice
[`Iterator::collect`]: https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.collect
[`slice::into_vec`]: https://doc.rust-lang.org/std/primitive.slice.html#method.into_vec

## `ThinVec`

For frequently empty collections, [`thin_vec`] provides `ThinVec<T>`, which
stores the length and capacity alongside the elements in its allocation.
The empty value needs no allocation, and `size_of::<ThinVec<T>>()` is one
word. Unlike a boxed slice, it can grow; compare its API and runtime costs
with `Vec` for the operations you need.

[`thin_vec`]: https://crates.io/crates/thin-vec

## Avoiding Regressions

If a type is hot enough that its size can affect performance, it is a good idea
to use a static assertion to ensure that it does not accidentally regress. The
following example uses a macro from the [`static_assertions`] crate.
```rust,ignore
  // This type is used a lot. Make sure it doesn't unintentionally get bigger.
  #[cfg(target_arch = "x86_64")]
  static_assertions::assert_eq_size!(HotType, [u8; 64]);
```
The `cfg` attribute is important, because type sizes can vary on different
platforms. Restricting the assertion to `x86_64` (which is typically the most
widely-used platform) is likely to be good enough to prevent regressions in
practice.

[`static_assertions`]: https://crates.io/crates/static_assertions
