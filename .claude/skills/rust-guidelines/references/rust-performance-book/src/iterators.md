# Iterators

## `collect` and `extend`

[`Iterator::collect`] converts an iterator into a collection such as `Vec`,
which typically requires an allocation. You should avoid calling `collect` if
the collection is then only iterated over again.

[`Iterator::collect`]: https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.collect

For this reason, it is often better to return an iterator type like `impl
Iterator<Item=T>` from a function than a `Vec<T>`. Note that sometimes
additional lifetimes are required on these return types, as [this blog post]
explains.
[**Example**](https://github.com/rust-lang/rust/pull/77990/commits/660d8a6550a126797aa66a417137e39a5639451b).

[this blog post]: https://blog.katona.me/2019/12/29/Rust-Lifetimes-and-Iterators/

Similarly, you can use [`extend`] to extend an existing collection (such as a
`Vec`) with an iterator, rather than collecting the iterator into a `Vec` and
then using [`append`].

[`extend`]: https://doc.rust-lang.org/std/iter/trait.Extend.html#tymethod.extend
[`append`]: https://doc.rust-lang.org/std/vec/struct.Vec.html#method.append

When implementing an iterator, provide an accurate [`Iterator::size_hint`].
If it always knows its exact remaining length, implement
[`ExactSizeIterator`] too; its default `len` uses `size_hint`. Consumers
such as `collect` and `extend` can use the size hint to allocate efficiently.

[`Iterator::size_hint`]: https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.size_hint
[`ExactSizeIterator`]: https://doc.rust-lang.org/std/iter/trait.ExactSizeIterator.html

## Chaining

[`chain`] can be very convenient, but it can also be slower than a single
iterator. It may be worth avoiding for hot iterators, if possible.
[**Example**](https://github.com/rust-lang/rust/pull/64801/commits/5ca99b750e455e9b5e13e83d0d7886486231e48a).

Similarly, [`filter_map`] may be faster than using [`filter`] followed by
[`map`].

[`chain`]: https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.chain
[`filter_map`]: https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.filter_map
[`filter`]: https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.filter
[`map`]: https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.map

For a fixed number of repetitions of a cloneable value, [`iter::repeat_n`]
can avoid cloning the last item, unlike `repeat(value).take(n)`.

[`iter::repeat_n`]: https://doc.rust-lang.org/std/iter/fn.repeat_n.html

## Chunks

When a chunking iterator is required and the chunk size is known to exactly
divide the slice length, use the faster [`slice::chunks_exact`] instead of [`slice::chunks`].

When the chunk size is not known to exactly divide the slice length, it can
still be faster to use `slice::chunks_exact` in combination with either
[`ChunksExact::remainder`] or manual handling of excess elements.
[**Example 1**](https://github.com/johannesvollmer/exrs/pull/173/files),
[**Example 2**](https://github.com/johannesvollmer/exrs/pull/175/files).

The same is true for related iterators:
- [`slice::rchunks`], [`slice::rchunks_exact`], and [`RChunksExact::remainder`];
- [`slice::chunks_mut`], [`slice::chunks_exact_mut`], and [`ChunksExactMut::into_remainder`];
- [`slice::rchunks_mut`], [`slice::rchunks_exact_mut`], and [`RChunksExactMut::into_remainder`].

For a const chunk size, [`slice::as_chunks::<N>`] returns references to arrays
and the remainder; `as_chunks_mut` does the same for mutable slices. Unlike
`chunks_exact`, they do not require an iterator. On nightly only,
`Iterator::array_chunks::<N>` yields owned arrays from any iterator with
`#![feature(iter_array_chunks)]`.

[`slice::as_chunks::<N>`]: https://doc.rust-lang.org/std/primitive.slice.html#method.as_chunks
[`Iterator::array_chunks::<N>`]: https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.array_chunks

[`slice::chunks`]: https://doc.rust-lang.org/stable/std/primitive.slice.html#method.chunks
[`slice::chunks_exact`]: https://doc.rust-lang.org/stable/std/primitive.slice.html#method.chunks_exact
[`ChunksExact::remainder`]: https://doc.rust-lang.org/stable/std/slice/struct.ChunksExact.html#method.remainder

[`slice::rchunks`]: https://doc.rust-lang.org/stable/std/primitive.slice.html#method.rchunks
[`slice::rchunks_exact`]: https://doc.rust-lang.org/stable/std/primitive.slice.html#method.rchunks_exact
[`RChunksExact::remainder`]: https://doc.rust-lang.org/stable/std/slice/struct.RChunksExact.html#method.remainder

[`slice::chunks_mut`]: https://doc.rust-lang.org/stable/std/primitive.slice.html#method.chunks_mut
[`slice::chunks_exact_mut`]: https://doc.rust-lang.org/stable/std/primitive.slice.html#method.chunks_exact_mut
[`ChunksExactMut::into_remainder`]: https://doc.rust-lang.org/stable/std/slice/struct.ChunksExactMut.html#method.into_remainder

[`slice::rchunks_mut`]: https://doc.rust-lang.org/stable/std/primitive.slice.html#method.rchunks_mut
[`slice::rchunks_exact_mut`]: https://doc.rust-lang.org/stable/std/primitive.slice.html#method.rchunks_exact_mut
[`RChunksExactMut::into_remainder`]: https://doc.rust-lang.org/stable/std/slice/struct.RChunksExactMut.html#method.into_remainder

## `copied`

When iterating over collections of small data types, such as integers, it may
be better to use `iter().copied()` instead of `iter()`. Whatever consumes that
iterator will receive the integers by value instead of by reference, and LLVM
may generate better code in that case.
[**Example 1**](https://github.com/rust-lang/rust/issues/106539),
[**Example 2**](https://github.com/rust-lang/rust/issues/113789).

This is an advanced technique. You might need to check the generated machine
code to be certain it is having an effect. See the [Machine
Code](machine-code.md) chapter for details on how to do that.
