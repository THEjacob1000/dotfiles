---
paths:
  - "**/*.rs"
  - "*.rs"
generated-by: numen-sync
---

# How to get Rust right

These are implementation rules, including style defaults, not optional cleanup advice. Apply them while designing the API and review the call sites too. A wrapper or enum does not enforce anything if callers can bypass it. Correctness takes priority over style and small performance costs; explain a necessary exception rather than silently ignoring a rule.

1. "If you can move it to compile time, do it at compile time."
   Otherwise validate at the earliest boundary with enough information, then carry that guarantee forward. Don't repeatedly parse or validate the same data internally. Mutable facts, like permissions or available funds, still need checking when the operation happens.

2. "Make incorrect program states unrepresentable."
   Use enums, private fields, and checked constructors so ordinary code cannot construct invalid states or perform invalid transitions. Remove avoidable failure paths through the types. External rejection, outages, and uncertain outcomes still need representing.

   When an operation requires a previous step, take the previous step's typed output, not a status flag plus unrelated data. Use payload-carrying enums for runtime alternatives and consuming transitions or typestate when the API must enforce ordering. Don't expose constructors, setters, `Default`, or `Clone` implementations that bypass the guarantee or duplicate a single-use capability. A recorded state snapshot is data, not automatically a state machine; external state still needs runtime checks.

3. "Parametrize what actually varies."
   This includes generics/traits, but there should be a reason for them to exist. If the concrete type does the job, just use it. More generics does not mean better Rust.

4. "If you do not need the data after the operation, move it instead of cloning it."

5. "Abuse std library types and traits to encode your domain logic."
   Before writing a helper, container, traversal, or state-management abstraction, look for the standard-library operation that removes the need for it. Prefer deleting custom machinery to wrapping it in more types. Check the relevant API before claiming std can't do the job. New code should supply domain policy, not reimplement collection mechanics.

   Prefer `From`, `TryFrom`, `FromStr`, `AsRef`, `Iterator`, and `IntoIterator` over bespoke equivalents when their contracts fit. Implement `From`, not `Into`, for an owned conversion; use `TryFrom` for fallible conversion and `FromStr` for parsing borrowed text. `From` must be infallible, semantically lossless, value-preserving, and obvious. An effectful operation or a conversion needing policy, I/O, or extra context belongs in a named function or method, not a misleading `From` implementation.

   Don't use numeric `as` casts to dodge conversion checks. Use `From` for lossless conversions and `TryFrom` when range or sign can fail. Give constants the type their consumer needs; use const evaluation to prove static bounds instead of runtime checks or truncating casts. If intentional truncation or representation-level casting is unavoidable, make the policy and range proof explicit at that boundary.

6. "Returning primitives is almost always a programmer's failure to correctly use the type system."
   This means that if you find yourself returning primitive types (like booleans, integers, tuples) that are meant to represent complex data,
   it's often a sign that you should be defining a new struct or enum to represent that data more clearly, safely
   and to align with the previous rule around making incorrect states unrepresentable.
   Taking them is the same failure and I treat it as a code smell: a function that takes `bool, bool, u32`
   should be taking a struct or an enum.

   Don't flatten a domain enum back into several booleans or independent `Option`s and make callers rebuild its meaning. Match the typed state directly. Keep primitive projections at the boundary that actually requires them, such as SQL parameters, and derive correlated fields together with an exhaustive match. Booleans are fine for genuine predicates, not as substitutes for lifecycle outcomes. Bitflags represent independent combinable flags, not mutually exclusive states or ordered transitions.

   Private database row types may mirror primitive columns. Decode them immediately into domain types, using `TryFrom` when combinations can be invalid. Don't confuse SQL `AS` column aliases with Rust `as` casts, or a row describing an atomic database result with an in-memory transition capability.

7. "For borderline cases, a type alias beats an anonymous tuple."
   An alias only names a shape; it does not distinguish identifiers, units, or validated values. Use a newtype for those. Reuse an existing type when meaning and invariants really are identical; don't multiply wrappers or outcome enums just to rename the same concept.

8. "If you've validated something, don't immediately throw that information away."
   This is rule 2 applied at a boundary. Return a type that can ONLY be constructed with valid data, so callers don't have to remember what you checked. Deserialization and database decoding must preserve those invariants too. Validate once at construction instead of repeating the work at every use.

9. "Failure is a valid state. Model it properly."
   Use types to eliminate avoidable failures, then preserve the distinctions callers need for the rest. `Option` means absence; the caller decides whether that is an error. `Result` carries success or an error. `Result<Option<T>, E>` distinguishes not found from couldn't check. Rejection and an unknown outcome are different too: a timeout does NOT mean the operation didn't happen.

   Prefer `Result<Outcome, E>` when success includes named alternatives such as `Recorded(value)` and `Suppressed`. Don't hide suppression, deferral, or partial completion inside `None`. Keep `Result<Option<T>, E>` for actual optional results from fallible operations. Use `as_ref`, `map`, `and_then`, `transpose`, and `?` where they express the operation directly; never use `.ok()`, defaults, or filtering to erase an error just to simplify the type.

10. "If something can grow indefinitely, it eventually will."
    Encode meaningful limits in types with checked construction and mutation. Bound queues, allocations, retries, batches, and concurrent work, especially when user input controls them. A bounded batch doesn't bound the number of batches running: enforce admission with a permit or another runtime limit. Decide what happens when a bound is reached.

11. "Test whatever actually provides the guarantee."
    Test pure logic directly. Inject dependencies through real trait boundaries to exercise behavior and failure paths. A fake satisfying the same trait doesn't prove production auth, transactions, or protocol behavior. Test those adapters against the thing they're integrating with; don't invent abstractions just to mock every call.

    For a public invariant or transition enforced by types, add focused compile-fail coverage with a compiling valid counterpart. Check that failure is for the intended reason, not an unrelated syntax or import error. Don't maintain runtime tests enumerating internal combinations that can no longer be constructed. Keep tests for boundary validation, transition behavior, external effects, and runtime failures; compiling alone doesn't prove those.

12. "Make it correct. Then prove it's fast."
    A small performance cost is worth a meaningful correctness guarantee. A MASSIVE regression needs investigation. Structure expensive database and external-service boundaries to support batching where the operation allows it, with bounded batch sizes and concurrency. Measure latency, throughput, and resource use, including slow dependencies and retries. Batching can increase waiting time, lock duration, and retry cost; code looking cheaper does not mean it actually is.

13. "Debug output still leaves your program."
    Keep secrets in private wrapper types with redacted `Debug`, and redacted `Display` if display is needed. Don't derive formatting that exposes the underlying value. Raw access should be explicit and limited to where the credential is needed. Formatting controls don't protect serialization, raw-value logging, or error messages; check those paths too.

14. "Model concurrent work through ownership."
    Understand how futures are polled, suspended, and dropped, and distinguish a future from a spawned task or a thread. Know who owns the work, observes completion or failure, and waits for shutdown. Make what survives cancellation explicit.

15. "Use ownership and guards to enforce resource lifetimes."
    Use RAII and `Drop` for cleanup, lock release, and transaction rollback instead of relying on callers to remember. Know what the guard guarantees: dropping an uncommitted transaction can initiate rollback, but cannot undo a completed external request. Cleanup that needs to finish asynchronously needs an explicit completion path; `Drop` cannot await it.

16. "Express traversal as traversal, not bookkeeping."
    Prefer iterators and combinators over indexing, temporary mutable accumulators, and hand-written map/filter loops. Use `collect`, `fold`, or `try_fold` to produce a result; don't mutate an outer variable from a `map` or `filter` closure. Keep traversal lazy until a consumer needs materialization. Implement `Iterator` or `IntoIterator` for a real synchronous traversal abstraction. Use a stream or explicit async loop for asynchronous work; don't disguise it as a synchronous iterator when nonblocking progress or cancellation is part of the contract.

    Keep `for` loops for ordered side effects or control flow they express more clearly. `for _ in 0..limit` is valid bounded repetition. A paginator should own its cursor and progression checks instead of making every consumer implement them again. Preserve page limits, empty-page continuation, error propagation, and cancellation behavior when replacing a loop; laziness alone does not bound work.

17. "Don't wrap plain data in boilerplate accessors."
    For a plain record with independently valid fields, prefer direct field access at the narrowest useful visibility over trivial getters and setters. Keep fields private when construction, mutation, or exposure must be controlled. For cheap infallible borrowed views, prefer `AsRef<T>` to a bespoke forwarding method when the view is unambiguous; a named accessor is still appropriate when its name carries meaning the trait would hide. Never expose mutable access that invalidates a checked wrapper.

    Don't implement `Deref` merely because a type wraps another type. Reserve it for deliberate pointer-like behavior where implicit access to the target API is part of the contract. Use `Borrow<T>` only when the borrowed and owned forms have equivalent equality, ordering, and hashing semantics.

18. "Let pattern matching show the whole decision."
    Prefer one exhaustive match over repeated variant checks or boolean comparisons. Merge identical arms with or-patterns, use `Variant { .. }` for unused payloads, and use pure guards to collapse a nested condition when the result is clearer. Prefer `?`, `let ... else`, and standard combinators over hand-written propagation. Don't move I/O or mutation into a guard to save lines. For an enum whose new variants require deliberate handling, don't add a catch-all arm that silently accepts them.

19. "Give each error boundary a coherent type."
    Prefer a typed error enum with `thiserror` at a cohesive crate or module boundary, with a local `Result<T>` alias where it improves clarity. Re-export descriptive names when callers need them. Consolidate repeated classifications and use `From` plus `?` for context-free conversions; retain named mappings when operation context changes the meaning. Don't force unrelated operations into one giant crate error, leak dependency-specific errors through domain APIs, or retain sensitive raw errors just to preserve a source chain. Callers must be able to match the distinctions that affect recovery.

20. "Implement the standard traits your value semantics support."
    Prefer derived `PartialEq`/`Eq`, `Hash`, and `PartialOrd`/`Ord` when their semantics fit the type and its consumers. Equal values must hash equally; ordering must agree with equality. `Hash` does not require `Ord`. Don't hand-roll comparison or hashing helpers, invent meaningless ordering, or use `std::hash::Hash` as a stable persisted or cryptographic digest. A digest identifier remains its own domain type.

21. "Choose the collection that already implements the operations you need."
    Start from the whole access pattern, not one insertion or loop. Use `Vec` for contiguous sequences, `VecDeque` for queues and operations at both ends, `HashMap`/`HashSet` for unordered lookup or membership, `BTreeMap`/`BTreeSet` for key-ordered traversal and range queries, and `BinaryHeap` for priority retrieval. Don't build linked nodes, repeatedly sort a map's keys, or linearly search a sequence when a standard collection already expresses the required operations. `LinkedList` needs a concrete reason its list operations beat `Vec` or `VecDeque`; unknown length is not that reason.

    Use `entry` for lookup-and-update, `range` for ordered subsets, and standard `retain`, `extend`, and consuming iterators where they replace custom bookkeeping. Preserve duplicate-key behavior and ordering semantics when changing collection types; a map is not a sequence and silently replacing an existing value may be wrong. Keep domain validation around the collection where std cannot enforce it. Choose for required semantics first, then measure material performance tradeoffs rather than assuming a tree, hash table, or iterator is always faster.

Enums encode alternatives, often states. Structs group data, including invariant-carrying data. Use methods for operations on a type and free functions where they make the transformation clearer; neither is inherently better. Standard traits win when the operation meets their contract.

Before handing off Rust changes, check the API and its callers for bypasses, enum-to-flag flattening, unchecked casts, needless clones, mutable traversal bookkeeping, trivial accessors, duplicated conversions, scattered error classification, and custom machinery std could replace. Use compiler checks, compile-fail tests, and the repository's lint gates for what they can enforce. Review the remaining style rules explicitly; passing tests is not evidence that these rules were followed.
