# performance

Read the rules relevant to the current change. Paths are relative to this index.

Baseline: the [Rust Performance Book](../rust-performance-book/src/SUMMARY.md), notably [benchmarking](../rust-performance-book/src/benchmarking.md), [build configuration](../rust-performance-book/src/build-configuration.md), [profiling](../rust-performance-book/src/profiling.md), [heap allocations](../rust-performance-book/src/heap-allocations.md), [type sizes](../rust-performance-book/src/type-sizes.md), [hashing](../rust-performance-book/src/hashing.md), [inlining](../rust-performance-book/src/inlining.md), [bounds checks](../rust-performance-book/src/bounds-checks.md), [iterators](../rust-performance-book/src/iterators.md), [I/O](../rust-performance-book/src/io.md) and [compile times](../rust-performance-book/src/compile-times.md). API shape: [flexibility](../rust-api-guidelines/src/flexibility.md). Measure first; read the relevant chapters with the Microsoft rules below.

- [M-ASYNC-STACK-SIZE: Hot `async` functions reduce stack size](../microsoft/src/guidelines/performance/M-ASYNC-STACK-SIZE.md)
- [M-AVOID-INDIRECTION: Nested type hierarchies should avoid needless indirection](../microsoft/src/guidelines/performance/M-AVOID-INDIRECTION.md)
- [M-BOX-DST: Use boxed slices and strings for immutable owned sequences](../microsoft/src/guidelines/performance/M-BOX-DST.md)
- [M-FAST-HASHER: Use a fast hasher where possible](../microsoft/src/guidelines/performance/M-FAST-HASHER.md)
- [M-HOTPATH: Identify, profile, optimize the hot path early](../microsoft/src/guidelines/performance/M-HOTPATH.md)
- [M-INITIAL-CAPACITY: Collections are created with sufficient initial capacity](../microsoft/src/guidelines/performance/M-INITIAL-CAPACITY.md)
- [M-LOG-OVERHEAD: Library telemetry does not tank performance](../microsoft/src/guidelines/performance/M-LOG-OVERHEAD.md)
- [M-MEM-REUSE: Reuse allocations where possible](../microsoft/src/guidelines/performance/M-MEM-REUSE.md)
- [M-SHRINK-TO-FIT: Shrink collections to fit after building](../microsoft/src/guidelines/performance/M-SHRINK-TO-FIT.md)
- [M-THROUGHPUT: Optimize for throughput, avoid empty cycles](../microsoft/src/guidelines/performance/M-THROUGHPUT.md)
- [M-YIELD-POINTS: Long-running tasks should have yield points](../microsoft/src/guidelines/performance/M-YIELD-POINTS.md)
