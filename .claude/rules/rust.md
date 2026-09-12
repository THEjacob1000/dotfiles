---
paths:
  - "**/*.rs"
  - "*.rs"
generated-by: numen-sync
---

# How to get Rust right

The most important Rust mantras you can repeat:

1. "If you can move it to compile time, do it at compile time."
   Otherwise validate at the earliest boundary with enough information, then carry that guarantee forward. Don't repeatedly parse or validate the same data internally. Mutable facts, like permissions or available funds, still need checking when the operation happens.

2. "Make incorrect program states unrepresentable."
   Use enums, private fields, and checked constructors so ordinary code cannot construct invalid states or perform invalid transitions. Remove avoidable failure paths through the types. External rejection, outages, and uncertain outcomes still need representing.

3. "Parametrize what actually varies."
   This includes generics/traits, but there should be a reason for them to exist. If the concrete type does the job, just use it. More generics does not mean better Rust.

4. "If you do not need the data after the operation, move it instead of cloning it."

5. "Abuse std library types and traits to encode your domain logic."
   For instance `impl From<ExternalThing> for MyThing` is the most powerful thing you can do.

   Creating methods that are simply `into_my_thing(self) -> MyThing` is a weaker version of that,
   and creating free functions like `fn from_external_thing(external: ExternalThing) -> MyThing` is even weaker.

6. "Returning primitives is almost always a programmer's failure to correctly use the type system."
   This means that if you find yourself returning primitive types (like booleans, integers, tuples) that are meant to represent complex data,
   it's often a sign that you should be defining a new struct or enum to represent that data more clearly, safely
   and to align with the previous rule around making incorrect states unrepresentable.
   Taking them is the same failure and I treat it as a code smell: a function that takes `bool, bool, u32`
   should be taking a struct or an enum.

7. "For borderline cases, a type alias beats an anonymous tuple."

8. "If you've validated something, don't immediately throw that information away."
   This is rule 2 applied at a boundary. Return a type that can ONLY be constructed with valid data, so callers don't have to remember what you checked. Deserialization and database decoding must preserve those invariants too. Validate once at construction instead of repeating the work at every use.

9. "Failure is a valid state. Model it properly."
   Use types to eliminate avoidable failures, then preserve the distinctions callers need for the rest. `Option` means absence; the caller decides whether that is an error. `Result` carries success or an error. `Result<Option<T>, E>` distinguishes not found from couldn't check. Rejection and an unknown outcome are different too: a timeout does NOT mean the operation didn't happen.

10. "If something can grow indefinitely, it eventually will."
    Encode meaningful limits in types with checked construction and mutation. Bound queues, allocations, retries, batches, and concurrent work, especially when user input controls them. A bounded batch doesn't bound the number of batches running: enforce admission with a permit or another runtime limit. Decide what happens when a bound is reached.

11. "Test whatever actually provides the guarantee."
    Test pure logic directly. Inject dependencies through real trait boundaries to exercise behavior and failure paths. A fake satisfying the same trait doesn't prove production auth, transactions, or protocol behavior. Test those adapters against the thing they're integrating with; don't invent abstractions just to mock every call.

12. "Make it correct. Then prove it's fast."
    A small performance cost is worth a meaningful correctness guarantee. A MASSIVE regression needs investigation. Structure expensive database and external-service boundaries to support batching where the operation allows it, with bounded batch sizes and concurrency. Measure latency, throughput, and resource use, including slow dependencies and retries. Batching can increase waiting time, lock duration, and retry cost; code looking cheaper does not mean it actually is.

13. "Debug output still leaves your program."
    Keep secrets in private wrapper types with redacted `Debug`, and redacted `Display` if display is needed. Don't derive formatting that exposes the underlying value. Raw access should be explicit and limited to where the credential is needed. Formatting controls don't protect serialization, raw-value logging, or error messages; check those paths too.

14. "Model concurrent work through ownership."
    Understand how futures are polled, suspended, and dropped, and distinguish a future from a spawned task or a thread. Know who owns the work, observes completion or failure, and waits for shutdown. Make what survives cancellation explicit.

15. "Use ownership and guards to enforce resource lifetimes."
    Use RAII and `Drop` for cleanup, lock release, and transaction rollback instead of relying on callers to remember. Know what the guard guarantees: dropping an uncommitted transaction can initiate rollback, but cannot undo a completed external request. Cleanup that needs to finish asynchronously needs an explicit completion path; `Drop` cannot await it.

- Enums are a STATE of something.
  Structs are a COLLECTION of data. A zip folder of bytes.

  Methods are _ONLY_ convenience from stealing tropes in other languages.
  Do not be afraid to have free-floating functions that take structs as arguments and return new structs.
