# Parallelism

Rust supports safe parallel programming, but the best way to introduce
parallelism depends on the workload and the cost of coordinating tasks.

For CPU-bound data-parallel work, [`rayon`] provides parallel iterators.
For a few independent tasks that borrow local data,
[`std::thread::scope`] spawns threads that are joined before the scope ends.
The [`crossbeam`] crate and [Rust Atomics and Locks][Atomics] cover further
thread-based techniques.

[`rayon`]: https://crates.io/crates/rayon
[`crossbeam`]: https://crates.io/crates/crossbeam
[`std::thread::scope`]: https://doc.rust-lang.org/std/thread/fn.scope.html
[Atomics]: https://marabos.nl/atomics/

For fine-grained data parallelism, [`core::arch`] provides architecture-specific
SIMD intrinsics. Portable SIMD, [`std::simd`], requires nightly-only
`#![feature(portable_simd)]`.

[`core::arch`]: https://doc.rust-lang.org/core/arch/index.html
[`std::simd`]: https://doc.rust-lang.org/std/simd/index.html

