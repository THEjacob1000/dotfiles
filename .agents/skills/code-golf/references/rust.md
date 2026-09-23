# Rust reduction catalog

Use this when Rust is in scope. The goal is to remove states, ownership machinery, duplicated policy, and failure paths, not to pack syntax. **Readability is a hard gate:** if the shorter version makes the invariant or order of effects harder to see, keep the longer version. Project architecture, MSRV, edition, supported targets, and public contracts win over any pattern here. For scope and evidence ledgers use [workflow](workflow.md); for cross-language proof and test retirement use [proof and tests](proof-and-tests.md).

## Put fixed facts in a compile-time context

A fixed table can be validated where it is defined rather than on every lookup. `const fn` only makes a function *eligible* for constant evaluation. A call with runtime inputs still runs at runtime; outside a const context even a constant expression may or may not be evaluated during compilation. Never remove validation of parsed data because the optimizer might fold a different call. [Rust Reference: constant evaluation](https://doc.rust-lang.org/reference/const_eval.html)

Before, the table invariant is checked on every lookup:

```rust
const LIMITS: [u8; 3] = [4, 8, 16];

fn limit(level: usize) -> Option<u8> {
    if LIMITS.iter().any(|&n| n == 0) {
        return None;
    }
    LIMITS.get(level).copied()
}
```

After, the *fixed* data is checked during compilation; the runtime index remains fallible:

```rust
const LIMITS: [u8; 3] = [4, 8, 16];
const _: () = {
    let mut index = 0;
    while index < LIMITS.len() {
        assert!(LIMITS[index] != 0);
        index += 1;
    }
};

fn limit(level: usize) -> Option<u8> {
    LIMITS.get(level).copied()
}
```

This is useful when literals or generated fixed data have an actual invariant and eliminating repeated checks simplifies consumers. If the data comes from a file, network, database, environment, FFI, or user at runtime, validate at that boundary. For a fallible `const fn` constructor, call it inside `const`/`static` initialization or an explicit `const { ... }` expression when compile-time rejection is intended; a normal call is not proof of compilation-time validation. Check the individual const APIs against the project's MSRV. Prove a deliberately invalid constant fails for the *intended* assertion and a valid constant compiles; separately prove runtime malformed inputs still fail cleanly. Avoid duplicating a fixed table merely to perform compile-time checks or introducing a build script for three literals.

## Replace impossible combinations with alternatives

A bool and an `Option<T>` form four combinations. If only two or three are meaningful, an enum can remove duplicate guards and make pattern matching exhaustive. This changes the internal representation; preserve wire or FFI shapes at their boundary. [Rust Reference: enums](https://doc.rust-lang.org/reference/items/enumerations.html), [visibility](https://doc.rust-lang.org/reference/visibility-and-privacy.html)

Before, `done = false` with `Some(receipt)` is possible and every consumer has to decide what that means:

```rust
struct Job {
    done: bool,
    receipt: Option<String>,
}

fn receipt(job: &Job) -> Option<&str> {
    if job.done { job.receipt.as_deref() } else { None }
}
```

After, assuming the domain really has only pending and completed-with-receipt:

```rust
enum Job {
    Pending,
    Completed { receipt: String },
}

fn receipt(job: &Job) -> Option<&str> {
    match job {
        Job::Pending => None,
        Job::Completed { receipt } => Some(receipt),
    }
}
```

If completion without a receipt is real, add a distinct variant or keep the original model. Don't conflate a missing receipt with pending. Likewise use `Option<T>` only when there really is one absence state; `Result<T, E>` when failure carries a distinction. A closed local enum yields useful exhaustive matches. A public enum may be an API compatibility commitment, `#[non_exhaustive]` asks downstream callers to handle future variants, and a protocol's unknown numeric/string tags may need an `Unknown(raw)` representation. Do not reject newer wire values or add a wildcard that silently treats them as a known case. Check serialization discriminants, snapshots, database rows, matching callers and ABI before cutover. [Rust Reference: non-exhaustive](https://doc.rust-lang.org/reference/attributes/type_system.html#the-non_exhaustive-attribute)

## Move a repeated numeric guard to one boundary

Use a checked type only when it erases a real family of downstream checks. `NonZeroUsize` models a nonzero divisor/count, and a private-field newtype models a domain range that the standard type cannot express. A bare public tuple field, an infallible `From<u8>` for a constrained month, or a public mutable reference to the underlying value defeats the guarantee. `Option<NonZero<T>>` has documented niche-layout guarantees for supported primitive types, but neither that layout nor a smaller source file is a reason by itself to change the domain model. [NonZero](https://doc.rust-lang.org/std/num/struct.NonZero.html), [M-STRONG-TYPES-GUARD](https://github.com/microsoft/rust-guidelines/blob/main/src/guidelines/libs/resilience/M-STRONG-TYPES-GUARD.md)

Before, checked at every operation despite the same count being reused:

```rust
fn page_count(total: usize, page_size: usize) -> Option<usize> {
    if page_size == 0 {
        return None;
    }
    Some(total / page_size + usize::from(total % page_size != 0))
}
```

After, *if* the caller already establishes a valid count at ingress and repeatedly uses it:

```rust
use std::num::NonZeroUsize;

fn page_count(total: usize, page_size: NonZeroUsize) -> usize {
    let size = page_size.get();
    total / size + usize::from(total % size != 0)
}

// At the untrusted input boundary, zero is still rejected:
// let page_size = NonZeroUsize::new(raw_size).ok_or(InputError::ZeroPageSize)?;
```

Changing a public function to accept `NonZeroUsize` may break callers; compare migration cost and contract first. If this is the sole operation, the original check is probably clearer than an extra type. For `Month(u8)`, `TryFrom<u8>` can enforce `1..=12`; `Clone`/`Copy` preserve that property, but `Default` cannot unless it picks a genuinely valid domain default. Do not implement `DerefMut`, `AsMut<u8>`, public setters, or conversions that leak a mutable primitive. A mutable setter must validate *before* changing state. A builder's `build()` must validate the final combination, not merely individual setters. `NonZero::new` is the safe ingress; do not use `new_unchecked` for shorter code. Check the declared MSRV: the generic `NonZero<T>` type is documented since 1.79, while concrete aliases may be available earlier. [NonZero API](https://doc.rust-lang.org/std/num/struct.NonZero.html), [Rust API Guidelines: custom types](https://rust-lang.github.io/api-guidelines/type-safety.html)

### Close every way into a checked value

Before deleting a downstream guard, enumerate *all* construction and mutation paths: direct literals in the defining module and descendants, public and crate-visible fields, constructors/builders, `Default`, `Clone`, `Copy`, `From`/`TryFrom`/`FromStr`, `Deserialize`, custom decoding, database mappers, setters, `Cell`/`RefCell`/atomics, `Mutex` accessors, raw pointers, `unsafe`, and FFI. Private fields limit *who can write them*, not what that module, a derive, or a custom deserializer writes. `#[derive(Deserialize)]` may construct a private-field struct directly without calling `new` or `TryFrom`. Deserialize into a wire-only shape, then call the checked constructor, or use a validated conversion/serde mechanism verified against the actual wire format. Test malformed, legacy and round-trip payloads. Do not assume `Default` or `Clone` is safe when it can trigger external effects or bypass a constructor. [Serde: implementing Deserialize](https://serde.rs/deserialize-struct.html), [Rust Reference: privacy](https://doc.rust-lang.org/reference/visibility-and-privacy.html)

A checked type proves only its *local, stable* property. It cannot prove a user is still authorized, a file still exists, a connection remains alive, or a remote peer accepted a write. Keep operation-time checks for facts that can change. For a proven static invariant, a focused downstream compile-fail witness attempting the forbidden construction and a positive compiling witness can support retiring a redundant runtime assertion; keep input-decoding and effects tests. Confirm the failure is specifically privacy/type rejection, not a typo or missing dependency. See [proof and tests](proof-and-tests.md).

## Use consuming transitions sparingly

If an operation must happen exactly in an order and a transition is consumed, represent it with a moved value rather than a boolean that every method rechecks. For example, a private `Draft` owning the request can expose `fn submit(self) -> Result<Submitted, Error>`; `Submitted` has no submit method, and only the success path returns it. This can delete repeated `if submitted` branches and double-submit tests when the API truly forbids reuse. But submission may fail with unknown outcome. Do not turn timeout into `Draft` and invite a blind retry, or turn it into `Submitted` and falsely promise success; retain an explicit uncertain state or reconciliation mechanism. Typestate with generic marker parameters, `PhantomData`, and trait bounds is worthwhile only if it makes several real invalid transitions unrepresentable *and* simpler to understand than explicit checks. A local linear method with one guard is often better. Audit clones, shared handles, deserialize, bypass constructors and interior mutation before declaring a single-use guarantee. Rust ownership alone does not establish exactly-once remote effects. [Rust book: ownership](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html), [Rust Reference: method receiver](https://doc.rust-lang.org/reference/items/associated-items.html#methods)

## Reuse standard algorithms without changing effects

Compare the precise behavior before replacing a loop: iteration order, first error versus all errors, partial mutation on failure, borrowed versus owned items, panic timing, side effects, and allocation. Iterators are lazy until consumed; `map` by itself does not perform an effect. `filter_map(Result::ok)` silently discards errors. `zip` stops at the shorter iterator, so it does not verify parallel input lengths. `collect` of `Result` or `Option` short-circuits on the first failure, not an aggregate of all failures. `try_fold`/`try_for_each` are for genuinely custom short-circuit accumulation; a clear loop can win the readability gate. [Iterator](https://doc.rust-lang.org/std/iter/trait.Iterator.html), [FromIterator](https://doc.rust-lang.org/std/iter/trait.FromIterator.html)

Before, a loop only accumulates parsed values and exits on the first parse error:

```rust
fn parse_ids(lines: &[String]) -> Result<Vec<u64>, std::num::ParseIntError> {
    let mut ids = Vec::new();
    for line in lines {
        ids.push(line.parse()?);
    }
    Ok(ids)
}
```

After, the operation is still first-error, input order is unchanged, and no partial vector escapes:

```rust
fn parse_ids(lines: &[String]) -> Result<Vec<u64>, std::num::ParseIntError> {
    lines.iter().map(|line| line.parse()).collect()
}
```

Refuse this transformation if the original loop reports line numbers, collects *all* parse errors, mutates a caller-owned vector incrementally, logs each attempted parse, reserves a required capacity, or must release a guard per item. Keep a loop if it names effects more clearly. Don't claim `collect` makes a particular capacity or allocation count: use `with_capacity` for a measured/documented requirement, `extend` to reuse an existing allocation, and inspect behavior rather than assuming optimizer elimination. [Vec](https://doc.rust-lang.org/std/vec/struct.Vec.html)

Other candidates: `retain` for in-place filtering when relative order and drop timing fit, `entry` for one lookup plus conditional insertion (avoid eager `or_insert` construction when `or_insert_with` is required), `mem::take` to move out a field only when its default replacement is valid, `drain` when removals and iterator drop semantics fit, `binary_search` only on sorted data, and `slice::windows` for adjacent reads instead of cloned neighboring slices. `HashMap` iteration order is not stable; don't substitute it for deterministic ordered output. Replacing a deliberate `Vec` scan with a hash table can add allocation and nondeterminism. [HashMap::entry](https://doc.rust-lang.org/std/collections/struct.HashMap.html#method.entry), [Vec::retain](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.retain), [mem::take](https://doc.rust-lang.org/std/mem/fn.take.html)

## Simplify error control flow without erasing the error

`?` can replace a forwarding `match` where `From` maps into exactly the same externally visible error. `Option::transpose` exchanges `Option<Result<T, E>>` with `Result<Option<T>, E>`; `Result::transpose` exchanges `Result<Option<T>, E>` with `Option<Result<T, E>>`. Use these only if absence and failure keep their original meanings. [Result and `?`](https://doc.rust-lang.org/std/result/index.html), [Option::transpose](https://doc.rust-lang.org/std/option/enum.Option.html#method.transpose), [Result::transpose](https://doc.rust-lang.org/std/result/enum.Result.html#method.transpose)

Before:

```rust
fn optional_limit(raw: Option<&str>) -> Result<Option<u32>, std::num::ParseIntError> {
    match raw {
        None => Ok(None),
        Some(text) => match text.parse() {
            Ok(limit) => Ok(Some(limit)),
            Err(error) => Err(error),
        },
    }
}
```

After:

```rust
fn optional_limit(raw: Option<&str>) -> Result<Option<u32>, std::num::ParseIntError> {
    raw.map(str::parse).transpose()
}
```

`None` remains distinct from an invalid present value. `Result::ok`, `unwrap_or_default`, an indiscriminate `Box<dyn Error>`, or mapping all variants to a string can merge meaningful rejection, retryable failure and unknown outcome. Preserve actionable context (including field/path), public variants, source chains, logging timing, and retryability. `?` returns early, so don't move it across cleanup or a side effect. Test the representative error boundary, not just the success path. `expect` is for an established programmer invariant, not malformed external input.

## Borrow or move instead of manufacturing owners

Replace needless `to_owned`/`clone` at a local call with `&str`/`&T` when the callee does not retain it; pass `String`/`Vec<T>` by value when the callee is the final owner. `Option::as_ref`, `Result::as_ref`, field splitting and shorter borrow scopes often remove a clone used to appease the borrow checker. Example: replace `fn lookup(&self, key: String)` with `fn lookup(&self, key: &str)` for an internal read-only lookup, and call `lookup(&request.key)` instead of `lookup(request.key.clone())`. If storage really needs a key, allocate exactly there. Do not change a public signature without migration review, return borrowed data beyond its owner, or use borrowed data across an async suspension unless the future's lifetime permits it. A background task needing `'static` or independently concurrent owners may need owned data. `Arc` is shared ownership, `Mutex` synchronized mutable access; neither should be introduced just to silence a borrow conflict, nor removed where sharing/synchronization is real. Benchmark allocations on a hot path instead of assuming a clone is expensive. [Rust book: references and borrowing](https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html), [std::sync::Arc](https://doc.rust-lang.org/std/sync/struct.Arc.html), [std::sync::Mutex](https://doc.rust-lang.org/std/sync/struct.Mutex.html)

## Let scope own infallible cleanup, keep explicit completion

A guard can replace duplicated unlock/release code in every branch; a `MutexGuard` already unlocks on drop. Prefer narrow scopes over `drop(guard)` if both express the lifetime clearly. Do not replace `flush`, `sync_all`, transaction commit, a fallible `close`, or async shutdown with `Drop`: destructors cannot report errors to the caller, and async completion requires awaiting an operation. Dropping a future can cancel work, not finish it. Keep a fallback destructor only when the resource contract allows best-effort cleanup. Moving a guard into an iterator closure or widening its scope may hold a lock across I/O or `.await`. Evaluate drop order, panic/unwind, process termination, and lock acquisition order. Struct fields drop in declaration order after the type's `Drop::drop`, local bindings in reverse declaration order; don't claim all temporaries share that ordering. [Rust Reference: destructors](https://doc.rust-lang.org/reference/destructors.html), [MutexGuard](https://doc.rust-lang.org/std/sync/struct.MutexGuard.html)

## Retire machinery, not real boundaries

- A one-use helper that forwards to std or a project utility with no policy, naming value, or test seam can be inlined. Keep a named domain operation when inlining forces readers to reconstruct what it means.
- `#[derive(Clone, Debug, PartialEq, ...)]` can replace a manual impl only if exact semantics match: `PartialEq` fields compared, secrets redacted in `Debug`, clone costs and external effects, ordering and hashing consistency. Conversely remove a derive if it exposes an invariant-breaking capability. Don't make a public API gain or lose traits casually. [Rust book: derivable traits](https://doc.rust-lang.org/book/appendix-03-derivable-traits.html)
- Remove a declarative macro or generic trait layer when it hides only one ordinary function with one concrete type; keep macros for real repetition that cannot be expressed clearly as a function. A proc macro introduces a crate, build/debug surface and generated API; use it only where a derive/generator genuinely eliminates more complexity than it creates. Inspect expansion and generated output before declaring code dead. [Rust Reference: macros](https://doc.rust-lang.org/reference/macros.html)
- Before replacing handwritten parsing, transport, or serialization with a dependency, compare feature graph, audit burden, compile time, MSRV, target support, and semantics. Conversely delete a dependency/build script only after checking generated code, `OUT_DIR` includes, linker flags, env inputs, `cargo:rerun-if-*`, build-time targets and downstream contracts. A library's native implementation isn't automatically equivalent. [Cargo build scripts](https://doc.rust-lang.org/cargo/reference/build-scripts.html)

## Scope the compiler's guarantee to the actual build

`#[cfg(...)]` removes an item/expression from a build; `cfg!(...)` is a boolean and does not by itself remove the other branch from parsing/type checking. A green default build says nothing about `--no-default-features`, additive feature combinations, alternate targets, examples, integration consumers, or generated code. Cargo unifies features across dependents; never delete a path because one local invocation does not exercise it. Verify the declared MSRV and edition rather than recommending a recently stabilized method based on current docs. For example, don't assume `Iterator::try_collect` is usable on the project's stable/MSRV; `collect::<Result<_, _>>()` remains a simpler established choice. [Rust Reference: conditional compilation](https://doc.rust-lang.org/reference/conditional-compilation.html), [Cargo features](https://doc.rust-lang.org/cargo/reference/features.html)

Preserve `no_std`/`alloc` boundaries and platform-specific system calls. Native and WASM builds differ in threading, filesystem and network APIs. SSR/server and browser/client targets may compile different cfg or feature paths, even when a function name is shared. Do not remove a server-only implementation after testing a browser bundle or vice versa. If supported targets or feature flags are unclear, mark the candidate unproven rather than treating an uncompiled branch as unreachable. Public wire enum evolution, plugin loading and FFI entrypoints also escape a local call graph. [Rust Reference: `no_std`](https://doc.rust-lang.org/reference/names/preludes.html#the-no_std-attribute), [Cargo target-specific dependencies](https://doc.rust-lang.org/cargo/reference/specifying-dependencies.html#platform-specific-dependencies)

## Proof and retirement for a Rust reduction

For each proposed deletion name the old obligation and where it moved: a const assertion, a private checked constructor, exhaustive matching, a standard library contract, or an unchanged runtime boundary. Compile supported feature/target combinations and downstream-facing negative and positive witnesses for type claims. Exercise boundary values, malformed deserialize/input, preserved error variants, observable side effects/order, and actual shutdown/IO behavior with the repository's normal verification tools. A compiler rejection is proof only for that invalid safe program in that build, not for network protocol, authorization, FFI, unsafe implementations or a future feature combination.

Classify each affected test: **keep** when it guards observable boundary behavior, **migrate** when a public contract moves, **retire** only when its exact obligation is now impossible through all supported safe paths and project policy permits deletion. Do not bulk-delete a test file, re-pin a test to private representation, or claim Rust's type checker replaces malformed input or external-effects tests. Some governing policies explicitly forbid test removal; follow them instead of claiming this guide overrides them. See [proof and tests](proof-and-tests.md). No ad-hoc `unsafe`, `transmute`, unchecked indexing, or unsafe trait impl just to shorten code. [Microsoft Rust guideline M-UNSAFE](https://github.com/microsoft/rust-guidelines/blob/main/src/guidelines/correctness/M-UNSAFE.md).
