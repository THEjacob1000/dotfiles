# Hashing

`HashSet` and `HashMap` are two widely-used types and there are ways to make
them faster.

## Alternative Hashers

The default algorithm in `std::collections::HashMap` and `HashSet` is
unspecified; it currently uses [SipHash 1-3]. It resists collision attacks but
can be slower for small keys such as integers. The separate `hashbrown` crate
defaults to [`foldhash`], which does not offer the same HashDoS protection.

[SipHash 1-3]: https://en.wikipedia.org/wiki/SipHash

If profiling shows that hashing is hot, and [HashDoS attacks] are not a concern
for your application, the use of hash tables with faster hash algorithms can
provide large speed wins.
- [`rustc-hash`] provides `FxHashSet` and `FxHashMap` aliases for standard hash
  collections using a fast, non-cryptographic polynomial hasher.
- [`fnv`] provides `FnvHashSet` and `FnvHashMap` aliases.
- [`ahash`] provides `AHashSet` and `AHashMap`; it can use AES instructions.
- [`foldhash`] provides `HashMap` and `HashSet` aliases with a fast hasher.
  Its default state is randomly seeded but is not suitable for hostile keys
  when attackers can infer the state from a long-running program.

[HashDoS attacks]: https://en.wikipedia.org/wiki/Collision_attack
[`rustc-hash`]: https://crates.io/crates/rustc-hash
[`fnv`]: https://crates.io/crates/fnv
[`ahash`]: https://crates.io/crates/ahash
[`foldhash`]: https://docs.rs/foldhash/latest/foldhash/

If hashing performance matters, benchmark alternatives on representative
keys and workloads; no single hasher is fastest for every key type.

If you decide to universally use one of the alternatives, such as
`FxHashSet`/`FxHashMap`, it is easy to accidentally use `HashSet`/`HashMap` in
some places. You can [use Clippy] to avoid this problem.

[use Clippy]: linting.md#disallowing-types

Some types don't need hashing. For example, you might have a newtype that wraps
an integer and the integer values are random, or close to random. For such a
type, the distribution of the hashed values won't be that different to the
distribution of the values themselves. In this case the [`nohash_hasher`] crate
can be useful.

[`nohash_hasher`]: https://crates.io/crates/nohash-hasher

Hash function design is a complex topic. The [`ahash` documentation] discusses
the alternatives.

[`ahash` documentation]: https://github.com/tkaitchuck/aHash/blob/master/compare/readme.md

## Byte-wise Hashing

When you annotate a type with `#[derive(Hash)]` the generated `hash` method
will hash each field separately. For some hash functions it may be faster to
convert the type to raw bytes and hash the bytes as a stream. This is possible
for types that satisfy certain properties such as having no padding bytes.

The [`zerocopy`] and [`bytemuck`] crates provide a `#[derive(ByteHash)]`
macro for byte-wise hashing. It requires a representation without uninitialised
padding (`IntoBytes` and `Immutable` for `zerocopy`, `NoUninit` for `bytemuck`).
The resulting hash can differ from `#[derive(Hash)]`. Measure carefully.

[`zerocopy`]: https://crates.io/crates/zerocopy
[`bytemuck`]: https://crates.io/crates/bytemuck

This is an advanced technique whose performance depends on the hasher and
the layout of the type.
