# Heap Allocations

Heap allocations have costs that depend on the allocator, allocation size, and
contention. They may involve allocator bookkeeping, synchronization, or system
calls. It is worth understanding which Rust operations allocate: avoiding
allocations on hot paths can improve performance.

The [Rust Container Cheat Sheet] has visualizations of common Rust types, and
is an excellent companion to the following sections.

[Rust Container Cheat Sheet]: https://docs.google.com/presentation/d/1q-c7UAyrUlM-eZyTo1pd8SZ0qwA_wYxmPZVOQkoDmH4/

## Profiling

If a general-purpose profiler shows `malloc`, `free`, and related functions as
hot, then it is likely worth trying to reduce the allocation rate and/or using
an alternative allocator.

[DHAT] is an excellent profiler to use when reducing allocation rates. It works
on Linux and some other Unixes. It precisely identifies hot allocation
sites and their allocation rates. Exact results will vary, but experience with
rustc has shown that reducing allocation rates by 10 allocations per million
instructions executed can have measurable performance improvements (e.g. ~1%).

[DHAT]: https://www.valgrind.org/docs/manual/dh-manual.html

For profiling without Valgrind, [dhat-rs] instruments a Rust global allocator.
Unlike DHAT, it does not track reads or writes to allocated memory.

Here is some example output from DHAT.
```text
AP 1.1/25 (2 children) {
  Total:     54,533,440 bytes (4.02%, 2,714.28/Minstr) in 458,839 blocks (7.72%, 22.84/Minstr), avg size 118.85 bytes, avg lifetime 1,127,259,403.64 instrs (5.61% of program duration)
  At t-gmax: 0 bytes (0%) in 0 blocks (0%), avg size 0 bytes
  At t-end:  0 bytes (0%) in 0 blocks (0%), avg size 0 bytes
  Reads:     15,993,012 bytes (0.29%, 796.02/Minstr), 0.29/byte
  Writes:    20,974,752 bytes (1.03%, 1,043.97/Minstr), 0.38/byte
  Allocated at {
    #1: 0x95CACC9: alloc (alloc.rs:72)
    #2: 0x95CACC9: alloc (alloc.rs:148)
    #3: 0x95CACC9: reserve_internal<syntax::tokenstream::TokenStream,alloc::alloc::Global> (raw_vec.rs:669)
    #4: 0x95CACC9: reserve<syntax::tokenstream::TokenStream,alloc::alloc::Global> (raw_vec.rs:492)
    #5: 0x95CACC9: reserve<syntax::tokenstream::TokenStream> (vec.rs:460)
    #6: 0x95CACC9: push<syntax::tokenstream::TokenStream> (vec.rs:989)
    #7: 0x95CACC9: parse_token_trees_until_close_delim (tokentrees.rs:27)
    #8: 0x95CACC9: syntax::parse::lexer::tokentrees::<impl syntax::parse::lexer::StringReader<'a>>::parse_token_tree (tokentrees.rs:81)
  }
}
```
DHAT shows where allocations happen, their size and lifetime, and how often
their memory is accessed. Run `valgrind --tool=dhat program` to collect a
profile and open the resulting `dhat.out.<pid>` in DHAT's viewer.

## `Box`

[`Box`] is the simplest heap-allocated type. A `Box<T>` value is a `T` value
that is allocated on the heap.

[`Box`]: https://doc.rust-lang.org/std/boxed/struct.Box.html

It is sometimes worth boxing one or more fields in a struct or enum fields to
make a type smaller. (See the [Type Sizes](type-sizes.md) chapter for more
about this.)

Other than that, `Box` is straightforward and does not offer much scope for
optimizations.

## `Rc`/`Arc`

[`Rc`]/[`Arc`] are similar to `Box`, but the value on the heap is accompanied by
two reference counts. They allow value sharing, which can be an effective way
to reduce memory usage.

[`Rc`]: https://doc.rust-lang.org/std/rc/struct.Rc.html
[`Arc`]: https://doc.rust-lang.org/std/sync/struct.Arc.html

However, if used for values that are rarely shared, they can increase allocation
rates by heap allocating values that might otherwise not be heap-allocated.
[**Example**](https://github.com/rust-lang/rust/pull/37373/commits/c440a7ae654fb641e68a9ee53b03bf3f7133c2fe).

Unlike `Box`, calling `clone` on an `Rc`/`Arc` value does not involve an
allocation. Instead, it merely increments a reference count.

## `Vec`

[`Vec`] is a heap-allocated type with a great deal of scope for optimizing the
number of allocations, and/or minimizing the amount of wasted space. To do this
requires understanding how its elements are stored.

[`Vec`]: https://doc.rust-lang.org/std/vec/struct.Vec.html

A `Vec` contains three words: a length, a capacity, and a pointer. The pointer
will point to heap-allocated memory if the capacity is nonzero and the element
size is nonzero; otherwise, it will not point to allocated memory.

Even if the `Vec` itself is not heap-allocated, the elements (if present and
nonzero-sized) always will be. If nonzero-sized elements are present, the
memory holding those elements may be larger than necessary, providing space for
additional future elements. The number of elements present is the length, and
the number of elements that could be held without reallocating is the capacity.

When a vector grows beyond its capacity, its allocation may grow in place or
its elements may move into a new allocation.

### `Vec` Growth

A new, empty `Vec` created by [`vec![]`](https://doc.rust-lang.org/std/macro.vec.html),
[`Vec::new`], or [`Vec::default`] has no heap allocation. Repeated pushes
periodically grow its capacity; the growth strategy is not specified.
Reallocations become less frequent as it grows, at the cost of excess capacity.

[`Vec::new`]: https://doc.rust-lang.org/std/vec/struct.Vec.html#method.new
[`Vec::default`]: https://doc.rust-lang.org/std/default/trait.Default.html#tymethod.default

Nightly-only `Vec::push_within_capacity` (`#![feature(vec_push_within_capacity)]`)
returns the element if the vector is full rather than allocating.

This growth strategy is typical for growable data structures and reasonable in
the general case, but if you know in advance the likely length of a vector you
can often do better. If you have a hot vector allocation site (e.g. a hot
[`Vec::push`] call), it is worth using [`eprintln!`] to print the vector length
at that site and then doing some post-processing (e.g. with [`counts`]) to
determine the length distribution. For example, you might have many short
vectors, or you might have a smaller number of very long vectors, and the best
way to optimize the allocation site will vary accordingly.

[`Vec::push`]: https://doc.rust-lang.org/std/vec/struct.Vec.html#method.push
[`eprintln!`]: https://doc.rust-lang.org/std/macro.eprintln.html
[`counts`]: https://github.com/nnethercote/counts/

### Short `Vec`s

For many short vectors, the [`smallvec`] crate provides `SmallVec<[T; N]>`,
which stores up to `N` elements inline and spills to the heap if needed.
Replace `vec![]` literals with `smallvec![]` literals.
[**Example 1**](https://github.com/rust-lang/rust/pull/50565/commits/78262e700dc6a7b57e376742f344e80115d2d3f2),
[**Example 2**](https://github.com/rust-lang/rust/pull/55383/commits/526dc1421b48e3ee8357d58d997e7a0f4bb26915).

[`smallvec`]: https://crates.io/crates/smallvec

`SmallVec` reduces allocations when values fit inline, but may not improve
speed: operations must distinguish inline from heap storage. Large `N` or `T`
also makes the value expensive to move. Benchmark the change.

If the maximum length is known, [`arrayvec`] provides `ArrayVec<T, N>`,
which keeps elements inline and cannot grow beyond `N` (ordinary `push`
panics when full; `try_push` returns an error).
[**Example**](https://github.com/rust-lang/rust/pull/74310/commits/c492ca40a288d8a85353ba112c4d38fe87ef453e).

[`arrayvec`]: https://crates.io/crates/arrayvec

### Longer `Vec`s

If you know the likely size of a vector, reserve capacity with
[`Vec::with_capacity`], [`Vec::reserve`], or [`Vec::reserve_exact`].
Reserving enough capacity avoids intermediate reallocations when adding
elements one at a time.
[**Example**](https://github.com/rust-lang/rust/pull/77990/commits/a7f2bb634308a5f05f2af716482b67ba43701681).

[`Vec::with_capacity`]: https://doc.rust-lang.org/std/vec/struct.Vec.html#method.with_capacity
[`Vec::reserve`]: https://doc.rust-lang.org/std/vec/struct.Vec.html#method.reserve
[`Vec::reserve_exact`]: https://doc.rust-lang.org/std/vec/struct.Vec.html#method.reserve_exact

If you know the maximum length, reserving only that much can avoid excess
capacity. [`Vec::shrink_to_fit`] can reduce wasted space, but may reallocate.

[`Vec::shrink_to_fit`]: https://doc.rust-lang.org/std/vec/struct.Vec.html#method.shrink_to_fit

## `String`

A [`String`] contains heap-allocated bytes. The representation and operation of
`String` are very similar to that of `Vec<u8>`. Many `Vec` methods relating to
growth and capacity have equivalents for `String`, such as
[`String::with_capacity`].

[`String`]: https://doc.rust-lang.org/std/string/struct.String.html
[`String::with_capacity`]: https://doc.rust-lang.org/std/string/struct.String.html#method.with_capacity

The `SmallString` type from the [`smallstr`] crate is similar to the `SmallVec`
type.

[`smallstr`]: https://crates.io/crates/smallstr

The `String` type from [`smartstring`] stores short strings inline, avoiding
an allocation for strings of up to 23 bytes on 64-bit platforms.

[`smartstring`]: https://crates.io/crates/smartstring

The `format!` macro creates a `String`, usually allocating for non-empty
output. Constant text needs no `format!`: pass a `&'static str` literal where
ownership is not required. If the destination accepts formatted output
directly, [`std::format_args!`] or [`lazy_format`] can avoid an intermediate
`String`.
[**Example**](https://github.com/rust-lang/rust/pull/55905).

[`std::format_args!`]: https://doc.rust-lang.org/std/macro.format_args.html
[`lazy_format`]: https://crates.io/crates/lazy_format

## Hash Tables

[`HashSet`] and [`HashMap`] store keys and values in a table allocation that
may grow as entries are inserted. Like `Vec`, they provide capacity methods
such as [`HashSet::with_capacity`] to avoid repeated growth.

[`HashSet`]: https://doc.rust-lang.org/std/collections/struct.HashSet.html
[`HashMap`]: https://doc.rust-lang.org/std/collections/struct.HashMap.html
[`HashSet::with_capacity`]: https://doc.rust-lang.org/std/collections/struct.HashSet.html#method.with_capacity

## `clone`

Calling [`clone`] on a value containing owned heap memory often allocates.
For example, cloning a non-empty `Vec` allocates storage for its elements.
Cloning an `Rc`/`Arc` instead increments its reference count.

[`clone`]: https://doc.rust-lang.org/std/clone/trait.Clone.html#tymethod.clone

[`clone_from`] may reuse existing storage when cloning over an owned value.
For example, cloning into an existing `Vec` can reuse its allocation:
```rust
let mut v1: Vec<u32> = Vec::with_capacity(99);
let v2: Vec<u32> = vec![1, 2, 3];
v1.clone_from(&v2); // v1's allocation is reused
assert_eq!(v1.capacity(), 99);
```
Although `clone` usually causes allocations, it is a reasonable thing to use in
many circumstances and can often make code simpler. Use profiling data to see
which `clone` calls are hot and worth taking the effort to avoid.

[`clone_from`]: https://doc.rust-lang.org/std/clone/trait.Clone.html#method.clone_from

Sometimes Rust code ends up containing unnecessary `clone` calls, due to (a)
programmer error, or (b) changes in the code that render previously-necessary
`clone` calls unnecessary. If you see a hot `clone` call that does not seem
necessary, sometimes it can simply be removed.
[**Example 1**](https://github.com/rust-lang/rust/pull/37318/commits/e382267cfb9133ef12d59b66a2935ee45b546a61),
[**Example 2**](https://github.com/rust-lang/rust/pull/37705/commits/11c1126688bab32f76dbe1a973906c7586da143f),
[**Example 3**](https://github.com/rust-lang/rust/pull/64302/commits/36b37e22de92b584b9cf4464ed1d4ad317b798be).

## `to_owned`

[`ToOwned::to_owned`] is implemented for many common types. It creates owned
data from borrowed data, usually by cloning, and therefore often causes heap
allocations. For example, it can be used to create a `String` from a `&str`.

[`ToOwned::to_owned`]: https://doc.rust-lang.org/std/borrow/trait.ToOwned.html#tymethod.to_owned

Sometimes `to_owned` calls (and related calls such as `clone` and `to_string`)
can be avoided by storing a reference to borrowed data in a struct rather than
an owned copy. This requires lifetime annotations on the struct, complicating
the code, and should only be done when profiling and benchmarking shows that it
is worthwhile.
[**Example**](https://github.com/rust-lang/rust/pull/50855/commits/6872377357dbbf373cfd2aae352cb74cfcc66f34).

## `Cow`

Sometimes code handles both borrowed and owned data. For example, a
`Vec<String>` of error messages allocates even for static string literals:
```rust
let mut errors: Vec<String> = vec![];
errors.push("something went wrong".to_string());
errors.push(format!("something went wrong on line {}", 100));
```
That requires an allocation to turn the literal into a `String`.

[`Cow`] holds borrowed or owned data. `Cow::Borrowed(x)` stores a borrowed
value and `Cow::Owned(y)` stores an owned value. Conversions from common
string, slice, and path types let you use `into` or `Cow::from`.

[`Cow`]: https://doc.rust-lang.org/std/borrow/enum.Cow.html

```rust
use std::borrow::Cow;
let mut errors: Vec<Cow<'static, str>> = vec![];
errors.push(Cow::Borrowed("something went wrong"));
errors.push(Cow::Owned(format!("something went wrong on line {}", 100)));
errors.push(Cow::from("something else went wrong"));
errors.push(format!("something else went wrong on line {}", 101).into());
```
`errors` holds borrowed and owned values without allocating for the literals.
Other pairings include `&[T]`/`Vec<T>` and `&Path`/`PathBuf`.

[**Example 1**](https://github.com/rust-lang/rust/pull/37064/commits/b043e11de2eb2c60f7bfec5e15960f537b229e20),
[**Example 2**](https://github.com/rust-lang/rust/pull/56336/commits/787959c20d062d396b97a5566e0a766d963af022).

[`Cow::to_mut`] gives mutable access, cloning if the value is borrowed.
An already owned value can be mutated without cloning.

[`Deref`]: https://doc.rust-lang.org/std/ops/trait.Deref.html
[`Cow::to_mut`]: https://doc.rust-lang.org/std/borrow/enum.Cow.html#method.to_mut

This is useful for mostly read-only data that occasionally needs modification.

[**Example 1**](https://github.com/rust-lang/rust/pull/50855/commits/ad471452ba6fbbf91ad566dc4bdf1033a7281811),
[**Example 2**](https://github.com/rust-lang/rust/pull/68848/commits/67da45f5084f98eeb20cc6022d68788510dc832a).

Because `Cow` implements [`Deref`], you can call methods on its contents.
Its lifetime and conversions can complicate code; use it where allocations
matter.

## Reusing Collections

Sometimes you need to build up a collection such as a `Vec` in stages. It is
usually better to do this by modifying a single `Vec` than by building multiple
`Vec`s and then combining them.

For example, if you have a function `do_stuff` that produces a `Vec` that might
be called multiple times:
```rust
fn do_stuff(x: u32, y: u32) -> Vec<u32> {
    vec![x, y]
}
```
It might be better to instead modify a passed-in `Vec`:
```rust
fn do_stuff(x: u32, y: u32, vec: &mut Vec<u32>) {
    vec.push(x);
    vec.push(y);
}
```
Sometimes it is worth keeping around a "workhorse" collection that can be
reused. For example, if a `Vec` is needed for each iteration of a loop, you
could declare the `Vec` outside the loop, use it within the loop body, and then
call [`clear`] at the end of the loop body (to empty the `Vec` without affecting
its capacity). This avoids allocations at the cost of obscuring the fact that
each iteration's usage of the `Vec` is unrelated to the others.
[**Example 1**](https://github.com/rust-lang/rust/pull/77990/commits/45faeb43aecdc98c9e3f2b24edf2ecc71f39d323),
[**Example 2**](https://github.com/rust-lang/rust/pull/51870/commits/b0c78120e3ecae5f4043781f7a3f79e2277293e7).

[`clear`]: https://doc.rust-lang.org/std/vec/struct.Vec.html#method.clear

Similarly, it is sometimes worth keeping a workhorse collection within a
struct, to be reused in one or more methods that are called repeatedly.

## Reading Lines from a File

[`BufRead::lines`] makes it easy to read a file one line at a time:
```rust
# fn blah() -> Result<(), std::io::Error> {
# fn process(_: &str) {}
use std::io::{self, BufRead};
let mut lock = io::stdin().lock();
for line in lock.lines() {
    process(&line?);
}
# Ok(())
# }
```
But the iterator it produces returns `io::Result<String>`, which means it
allocates for every line in the file.

[`BufRead::lines`]: https://doc.rust-lang.org/stable/std/io/trait.BufRead.html#method.lines

An alternative is to use a workhorse `String` in a loop over
[`BufRead::read_line`]:
```rust
# fn blah() -> Result<(), std::io::Error> {
# fn process(_: &str) {}
use std::io::{self, BufRead};
let mut lock = io::stdin().lock();
let mut line = String::new();
while lock.read_line(&mut line)? != 0 {
    process(&line);
    line.clear();
}
# Ok(())
# }
```
This reduces the number of allocations to at most a handful, and possibly just
one. (The exact number depends on how many times `line` needs to be
reallocated, which depends on the distribution of line lengths in the file.)

This will only work if the loop body can operate on a `&str`, rather than a
`String`.

[`BufRead::read_line`]: https://doc.rust-lang.org/stable/std/io/trait.BufRead.html#method.read_line

[**Example**](https://github.com/nnethercote/counts/commit/7d39bbb1867720ef3b9799fee739cd717ad1539a).

## Using an Alternative Allocator

It is also possible to improve heap allocation performance without changing
your code, simply by using a different allocator. See the [Alternative
Allocators] section for details.

[Alternative Allocators]: build-configuration.md#alternative-allocators

## Avoiding Regressions

[dhat-rs] heap-usage tests can guard predictable allocation counts and sizes.
Run each in a separate integration-test process: the profiler is global, and
parallel tests otherwise interfere with measurements.

[dhat-rs]: https://crates.io/crates/dhat
