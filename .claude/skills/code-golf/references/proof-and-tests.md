# Proof and test retirement

A reduction is acceptable only when the supported contract survives *and the result is readable*. Fewer lines aren't a substitute for fewer concepts: reject dense one-liners, clever chains, compressed names, macro/type tricks, hidden effects or extra indirection if a longer direct implementation is easier to understand. "It compiles" proves that one program is well-typed under one configuration. "Tests pass" proves that the exercised observations still satisfy the existing assertions. Neither establishes equivalence for an untested input, a different feature set, or a wire client. Name the removed responsibility, the contract it served, and the evidence that the responsibility is now unnecessary or performed elsewhere.

## What can an observer tell?

Compare old and new behavior at the actual boundary, not at a private helper. List the supported callers and inputs, then check:

- Returned values, precision, normalization, empty and malformed inputs, and state transitions.
- Errors: whether failure occurs, its public type/code, response status/body, retryability, and whether partial state was committed. Exact prose matters only where the contract promises it.
- Ordering: output order, callback/event order, concurrency and cancellation, including whether a side effect occurs before failure.
- Timing where specified: timeout/deadline behavior and scheduling guarantees. Don't claim identical wall-clock duration for ordinary code.
- Resources: ownership, close/drop timing, lock scope, memory and allocation budgets where material, and cleanup on failure.
- API and wire compatibility: exported names/signatures, serialized names and defaults, request/response shape, persisted formats, migrations, consumers in other packages and languages.
- Security and trust boundaries: authorization, validation, escaping, secret handling and denial-of-service limits. A type or private field doesn't establish any of these at runtime.

Example: replacing `parse → validate → write` with `parse → write` is not a reduction because both paths return the same value on valid input. Compare malformed input and storage state. Likewise, replacing an ordered loop with concurrent work can return the same set while changing the visible order and first error. If a deliberate behavior change is desired, separate it from an equivalence claim and get authorization under the governing project process.

Concrete boundary traps: removing an explicit tenant/scope check because the request already has a typed `TenantId` may turn a fail-closed authorization rule into a cross-tenant read; prove the permission decision with an authenticated negative request, not a compile result. Replacing a DTO with a direct entity serialization can expose a previously omitted private field in browser JSON even when server callers still typecheck. Combining a phone update and verified-state reset into separate writes may make an intermediate verified-but-changed number observable; preserve atomicity and test the persisted state after failure.

## Evidence ladder

Start with a reasoned invariant and a complete inventory of the relevant producers, consumers and mutation points. Then use the smallest direct witness for each uncertain obligation: compiler/typechecker for static rejection, focused runtime examples for externally visible outcomes, boundary regression tests for recurring failure modes, differential runs for complex replacements, and measurements for performance claims. A whole-suite pass is a useful final signal, not a substitute for a missing witness. Record the exact environment: compiler/runtime version, edition/language target, enabled features/build tags, dependency versions and relevant config. A proof for one row does not silently cover another.

For a replacement algorithm, compare old and new implementations on representative, adversarial and generated inputs through the same public interface. Fix randomness and keep a minimal counterexample if found. Metamorphic properties help when no simple oracle exists, for example `decode(encode(x)) == x` on the documented domain, but that property alone won't detect both implementations losing the same metadata. Mutation witnesses are useful when an assertion's value is doubtful: temporarily introduce a plausible fault such as skipping authorization or changing error precedence; the retained test should fail for the right reason. Restore the implementation afterward. Don't turn randomized or mutation tools into a blanket mandate.

For version/config differences, make a small matrix of supported rows and the changed claim: Rust stable/MSRV × features/target, TS compiler target/module mode × bundler/runtime, Go version × build tags/architecture, plus schema/protocol versions where applicable. Include SSR versus browser hydration and WASM builds if those are supported surfaces; code that tree-shakes away in a browser build can still run on the server, and a platform-gated constructor may differ in WASM. Exercise affected rows or mark them unverified. A static proof under one configuration isn't a runtime proof in another.

## When the compiler is the witness

Static rejection can replace a runtime assertion only when the rejected state truly cannot be constructed by any supported caller and cannot arise after construction. Close *both* pathways:

1. Enumerate every constructor and conversion: public literals, defaults/zero values, factories, deserializers, reflection, plugin ABI, FFI and unsafe code, database hydration, test-only helpers and external consumers.
2. Enumerate mutation: setters, mutable aliases/interior mutability, shared maps/slices/arrays, callbacks and async tasks, raw pointers and external systems. Check whether validation occurs before or after mutation and on every ingress.
3. Identify the exact static rule, visibility boundary and configurations for which it holds. Prove the trusted constructor establishes the invariant and every permitted mutation preserves it. If a route remains open, retain the runtime guard or narrow the claim.

Rust private fields stop ordinary external struct-literal construction, not same-module/descendant code, an exposed unchecked constructor, unsafe/FFI, or deserialization that bypasses the intended factory. `#[derive(Deserialize)]` can construct a value from data without calling `new`; review that path before deleting `new`'s validation. For example, a claims type with private `tenant` and `scope` fields may still be populated by `serde_json` from an untrusted token or fixture; decoding a struct isn't equivalent to authenticating the token and authorizing the scope. Rust's privacy rules and unsafe proof obligations are separate [Rust Reference: visibility](https://doc.rust-lang.org/reference/visibility-and-privacy.html), [unsafe](https://doc.rust-lang.org/reference/unsafe-keyword.html).

TypeScript's `type Positive = number & { readonly __brand: unique symbol }` can constrain ordinary checked callsites, but `as Positive`, `any`, plain JavaScript, JSON, and third-party callers can still deliver invalid numbers. Assertions are erased and do not validate runtime data [TypeScript Handbook: type assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions). Go `type Port struct { n uint16 }` hides `n` from other packages, but `var p Port`, `Port{}` and package-internal literals produce the zero value; ensure zero is valid or check it. Go explicitly guarantees zero values [Go specification: zero value](https://go.dev/ref/spec#The_zero_value). These examples do not justify removing parsing, protocol, authentication, or persistence tests.

A compile-negative witness must fail *for the intended reason*, not merely return nonzero. Compile a positive control in the same harness, imports, dependency graph and compiler flags, then change only the forbidden operation in the negative case. Require the expected diagnostic/code at the relevant source span; reject missing imports, unavailable dependencies, syntax errors and unrelated type errors. For example, a Rust external-crate snippet should compile when it calls `Port::new(NonZeroU16::new(80).unwrap())` and fail specifically on `Port { n: NonZeroU16::new(80).unwrap() }` because `n` is private. That only proves a caller can't bypass the factory with a literal; the factory's own contract needs separate evidence. If the positive snippet cannot import the library, no privacy claim has been tested. `rustdoc`'s `compile_fail` checks failure to compile, not necessarily the diagnostic you intended; pair it with a harness that checks the error when that distinction matters [rustdoc: documentation tests](https://doc.rust-lang.org/rustdoc/write-documentation/documentation-tests.html#compile-fail). TS negative checks likewise need the intended diagnostic, not a broken module resolution; Go negative fixtures need the intended access/type error, not an unrelated package build failure.

A durable compile-negative test is worth keeping when an API change could plausibly reopen the invalid construction path. Otherwise a one-off controlled compilation can establish the fact without adding permanent test infrastructure. Neither proves that a network payload is valid, that permissions are enforced, or that cleanup happens.

## Decide per test, not per file

Inventory test names, assertions and fixtures before changing them. Give each assertion an obligation: which supported behavior would a plausible fault break? Then classify each test:

| Decision | Condition | Action |
| --- | --- | --- |
| Keep | Still protects a public boundary, failure, ordering, security property, resource lifecycle or plausible regression | Keep its observable assertion and update setup only when the API changes. |
| Migrate | Contract remains but entrypoint/representation changes | Move the assertion to the new public boundary; make sure it would fail if the behavior regressed. Don't rewrite it to assert private wiring. |
| Retire | Obligation was intentionally removed with authorization, is now impossible by closed static construction/mutation, or is redundantly proved by a surviving stronger witness | Name the reason and surviving witness. Remove only this test/assertion after checking no unique case is lost. |
| Block | Cannot establish the contract, the proof route, or governing policy permission | Preserve the test and report the unresolved obligation. |

An old test named `rejects negative port` might retire only if the *public input* changes to a type that cannot express negatives, every supported construction and mutation route is closed, and the compiler witness captures the boundary. If a runtime factory still accepts signed integers, its negative-input test stays: field privacy does not prove that factory's validation. Its sibling `rejects negative port in JSON request` stays: JSON reaches runtime without the compile-time guarantee. `closes socket on parse failure` stays even if parsing now returns a branded type because ownership and failure timing are independent properties. A duplicate fixture or tautological assertion can go; a malformed-input regression with a documented status code cannot be waved away as \"covered by types.\"

Never delete an entire test file because the associated helper vanished. Account for every test, assertion, dataset and fixture it contains first; migrate independent obligations and remove only truly obsolete material. Don't pad counts with renamed or vacuous assertions. Test count may decrease when obligations are genuinely retired, but report the decrease and what still catches plausible faults. Preserve boundary tests rather than retargeting them to the new internal decomposition.

Example ledger for a hypothetical simplification (illustrative counts, not a claimed run):

| Before → after | Obligation | Decision and evidence |
| --- | --- | --- |
| `PortTest` rejects zero in the old internal `u16` helper (1 → 0) | Typed internal caller cannot pass zero after helper takes `NonZeroU16` | Retire only after every caller migrates, all construction/mutation routes are accounted for, and a positive call compiles while a zero-value call produces the expected type diagnostic (not an import failure). Runtime ingress parsing still needs its own zero rejection. |
| `RequestTest` invalid JSON and 400 response (1 → 1) | Untrusted payload is rejected before write | Keep; ownership types don't parse JSON or prove status and storage state. |
| `TransportTest` failure closes connection (1 → 1) | Resource release on failure | Keep; static validity says nothing about cleanup. |
| `FormatterTest` private helper shape (1 → 0) | No consumer-visible obligation after helper deletion | Retire only after checking it contains no unique formatting boundary case. |

Here the suite has four tests before and two after; the invalid JSON/status/no-write and close-on-failure assertions remain. The retired internal zero check has a specific positive/negative type witness and closed construction pathways, and the private-shape test had no surviving contract. If a durable type witness is warranted because someone might reopen the API, the after-count is three instead. Report actual counts and unavailable baselines honestly; do not infer that a smaller count is inherently better.

## Policy and cost limits

Test retirement is conditional on governing project policy. `code-refinement` composes this proof policy with language-guideline enforcement; it does not grant permission to bypass a repository's no-deletion rule or numerical test gate. If the project forbids retirement, preserve or meaningfully migrate the tests within its rules and report the proposed deletion as blocked. A reviewed ledger explains a permitted retirement; it never excuses failed, newly ignored, weakened or unaccounted tests. Retain every project-required compatibility or security witness.

Measure performance only when the proposed reduction makes a performance claim or touches a known performance-sensitive path. Compare representative workloads with the same build mode, input distribution and environment, and record allocations/latency/throughput appropriate to the claim. A shorter loop isn't automatically faster, and a benchmark isn't mandatory for an unrelated simplification. If measurement is unavailable, say performance is unverified, not improved.
