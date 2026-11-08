# Design and concurrency

Use this local policy when changing Rust ownership, API shape or execution. Preserve repository architecture, public contracts, MSRV and supported targets. Read the relevant [Google sections](topics/google.md); use supplementary advice only where compatible. A cleanup should remove a concrete cost for a real caller, not recreate another language's framework in Rust.

## Model the operation, not the plumbing

- Give a workflow one owner for its state, effects and lifecycle. Pass stable configuration or snapshots to consumers instead of handing every layer the mutable driver. Prefer a named operation on the resource owner to a facade that relays its low-level steps. Keep real trust, transaction, protocol and supported replacement seams even with one implementation.
- Split modules or crates for a coherent owner, dependency/isolation boundary, supported release surface or measured build benefit, not a file-length target. Keep atomic operations together and remove obsolete forwarding layers after the move.
- Use ordinary structs, enums, matches and functions before a trait hierarchy or typestate framework. Name outcomes when a boolean, tuple or several optional fields hide distinct decisions. A newtype earns its cost by preventing meaningful confusion or enforcing a stable invariant; a wrapper around every primitive does not. Plain input/output/configuration structs can expose fields; private fields and accessors earn their place by preserving validation, normalization, identity, secrecy or cross-field consistency. Keep mutable external facts, including authorization and availability, checked at the operation boundary.
- Traits describe genuine shared behavior, supported substitution or an ownership boundary. Implement applicable standard traits when their semantics fit rather than inventing parallel conversion or iteration APIs. Prefer inherent methods for a concrete type's own operations; use generics for compile-time substitution and `dyn Trait` where runtime selection, heterogeneous storage or a deliberate erased boundary needs it (see below). A test double can justify a small effect seam, not a trait for every helper. Do not remove a required swappable interface because it has one current implementation.
- Make invalid API choices unavailable when practical. Named read and locked-read operations can be clearer than a lock-mode parameter whose other variants have no supported caller. Share the common decoding without hiding lock strength, acquisition order or transaction ownership. Such a simplification can add lines while removing states and decisions.
- Use standard or established dependency facilities when their semantics fit, such as CLI parsing, path handling or serialization. Check error precedence, wire format and supported platform behavior before replacing custom code. Keep domain validation at the boundary that owns it.

## Keep synchronous work synchronous

A calculation, parse or local state transition that never suspends normally stays a regular function, even when called by an async service. Let an outer adapter own scheduling and I/O. An `async` wrapper with no suspension does not make blocking work nonblocking, and a task immediately awaited may add lifecycle machinery without useful overlap. Preserve a supported async trait/protocol contract when it requires that shape.

Do not turn this into a synchronous-I/O mandate inside an executor. Blocking filesystem, database, subprocess or CPU work must not stall a cooperative runtime worker. Use the repository's bounded blocking bridge, dedicated worker or CPU pool when needed, and keep the inner operation synchronous. Check whether the apparent blocking operation is actually trivial before adding a new scheduling layer. Avoid nesting runtimes or introducing a sync-over-async bridge merely to keep a synchronous signature.

## Choose execution from the workload

Use the least machinery that meets the measured workload and dependencies. Existing runtime compatibility is a real constraint; a cleanup is not permission for a runtime migration.

- Sequential synchronous code fits a small ordered workflow without useful overlap.
- `std::thread::scope` fits a bounded set of blocking or CPU tasks that can borrow data and finish before the scope exits. Joining provides a lifetime boundary, not a timeout or cancellation mechanism; blocking operations still need their own bounds. A long-lived dedicated worker needs an explicit owner, shutdown signal and join policy.
- Rayon fits independent CPU/data-parallel work large enough to amortize scheduling. Bound the pool, preserve required ordering and failure semantics, and avoid making blocking I/O occupy the CPU pool. Do not create a pool per request or nest parallelism without accounting for the host's total budget.
- A lightweight executor such as smol can fit a modest async application whose I/O dependencies support it. Account for its reactor, blocking pool, task ownership and shutdown just as with a larger runtime. A smaller dependency list is not measured lower cost.
- Tokio fits an existing Tokio-based ecosystem or many concurrent I/O operations needing its timers, sockets and task facilities. Its presence does not make CPU-bound or blocking code async. Use bounded admission, queues and blocking work; don't introduce another runtime merely to avoid the one the dependencies already require.

Measure the relevant dimensions before claiming an improvement: representative concurrency and input sizes, latency/throughput, allocations, peak memory and thread count, plus build/dependency cost when that motivates the change. Separate fixture startup and compilation from execution. Do not infer a performance gain from fewer `async`, `Box` or source lines.

## Scope the actual work, not just the waiter

Keep child work attached to an owner that observes completion and failure. Prefer borrowing within a scope when the work cannot outlive it; don't manufacture `Arc`, locks and `'static` clones merely to satisfy an unnecessary detached spawn. Real shared or independent lifetimes still need ownership and synchronization.

Name the cancellation/shutdown contract: what stops admission, what signals cancellation, what drains or is abandoned, who observes panics/errors, and when resources are released. Dropping a future or handle does not universally stop a task; APIs differ. In particular, cancelling an await or timing out `spawn_blocking` does not stop work that has started. Capacity permits and resource guards must remain owned by the underlying work until it actually finishes. Bound cooperative operations or supervise and reap child processes where their contract permits it; a timeout around the waiter alone is not a resource bound.

For bounded background passes, test eventual progress across multiple ticks as well as the per-pass limit, including stale cursors, failed items and cancellation. Avoid restarting at the first page forever or retrying one poisoned item without a bounded recovery policy. Check the actual dependency's cancellation contract rather than assuming an executor supplies structured concurrency.

## Treat allocation, pinning and erasure separately

`Box<T>` supplies indirection/ownership, `Pin<P>` constrains movement of the pointee, and `dyn Trait` erases its concrete type. None implies the others. Prefer a concrete type, enum, native async function or `impl Future` when it expresses the supported contract without needless allocation or erasure. Don't add `Pin<Box<dyn Future>>` by habit or change an API only to remove its spelling.

Keep boxing for recursive/large representations, measured future-stack size or necessary owned indirection. Keep pinning when the future or API requires a stable address; safe stack pinning may suffice when the lifetime fits. Keep erasure for genuine runtime heterogeneity, higher-ranked callback constraints, stable boundaries or deliberate dependency decoupling. Check object safety, lifetimes, `Send` bounds and public compatibility before replacing a boxed async trait seam. Use safe projection when pinning is needed, not ad-hoc unsafe code to save an allocation. Typed errors and justified erased reporting follow [typed errors](typed-errors.md).
