# Reduction catalog

Use this as a hunt list, not a list of automatic rewrites. A candidate pays off when it removes a responsibility, source of truth, decision, dependency, or recurring work while leaving the supported contract intact. Readability is a hard gate: reject the shorter version if a maintainer has to decode denser control flow, clever syntax, hidden effects, or a new abstraction to understand it. A longer direct version wins over a compressed one. For the evidence needed at a public or trust boundary, see [proof and tests](proof-and-tests.md); for scope and execution, see [workflow](workflow.md).

## Ranked hunt order

1. Find behavior nobody needs or can invoke, including obsolete compatibility and speculative features. Deleting a whole responsibility usually beats rearranging it.
2. Find two owners of the same policy or state. Consolidate where their contracts genuinely coincide, not where names merely look alike.
3. Find layers whose only job is to forward to another layer, configuration with one supported value, and machinery built for one concrete use.
4. Find conversions, copies, caches, repeated computation, and custom implementations already covered by an existing dependency, standard library, or platform capability.
5. Find tangled branches and algorithms doing unnecessary work. Prefer explicit readable flow to the fewest statements. Measure runtime claims against the relevant workload.
6. Reconcile manifest, lockfile, tests, fixtures, generated files, configuration, and docs with each removed responsibility. These are part of the cutover, not an excuse to bulk-delete evidence.

The ranking is by likely maintenance payoff, not by certainty. A smaller candidate can be done first to make a larger cutover safe. Keep a high-impact candidate in scope even if it needs a separate proof plan.

## Delete whole obligations

### Unused functionality

**Apply:** A feature, variant, helper, export, branch, or background worker has no supported consumer and no product requirement. **Payoff:** Its implementation, configuration, failure modes, tests, and documentation can disappear together. **Keep when:** It is an entry point used by an external package, feature-gated build, migration, persisted format, plugin, reflection, generated registration, FFI, dynamic import, command-line invocation, or documented API. **Prove:** Identify the supported entry points and build configurations; trace reachability through both static and dynamic registration, search external references and deployment configuration where available, and establish that removing it does not break a supported consumer. A zero textual-call count is a lead, not proof.

**Before:** A report job computes CSV and JSON, but only JSON is requested and deployed. **After:** Remove the CSV route, format enum case, writer, option, and CSV-only fixtures after checking cron jobs and external users; do not merely hide the route behind a flag.

### Obsolete compatibility and speculative options

**Apply:** A migration window has closed with evidence, or an option/fallback has never represented a supported variation. **Payoff:** One fewer format, execution path, decision, and test matrix. **Keep when:** A deployed client, persisted record, old process, external integration, rollout, or real hardware variation still depends on the path; a calibration knob may be essential even when it has one current default. **Prove:** Name the support policy, versions/data still in use, rollout and rollback horizon, and actual callers. Exercise current and old supported inputs before removing a decoder, alias, flag, or fallback; remove obsolete docs and fixtures only once the old obligation truly ends.

**Before:** A loader accepts both an abandoned prototype format and the current schema forever. **After:** Retire the prototype parser only after deployed versions and stored records no longer require it, then remove the format switch and conversion tests specific to that retired contract.

### Dependency and scaffolding removal

**Apply:** A package is used only for a removed capability, or an existing/native facility fully covers its remaining contract. **Payoff:** Less update, security, bundle, licensing, and integration work, not just fewer import lines. **Keep when:** The dependency provides meaningful semantics such as internationalization, accessibility, security updates, performance, or cross-platform behavior that a replacement would have to own. **Prove:** Inventory every import, transitive use, runtime loader, code generator, build plugin, and target platform. Compare edge/error behavior, then remove or update imports, callers, manifest entries, lockfile, bundler/build config, generated artifacts, documentation, and dependency-specific fixtures as one cutover. Never edit a lockfile by guessing.

## Remove needless ownership and indirection

### One-use frameworks, wrappers, factories, and strategies

**Apply:** An abstraction has one concrete implementation and only forwards, selects a constant, or translates names without enforcing an invariant. **Payoff:** Fewer concepts and jumps to follow. **Keep when:** The seam enforces authorization or validation, controls lifetime/transactions, separates trust zones, isolates a platform boundary, enables a supported replacement, or is a deliberately stable public contract. One implementation is not by itself evidence of waste. **Prove:** Compare the wrapper's pre/postconditions, side effects, lifecycle, call sites, and supported swappability against the direct path; migrate all callers and delete the unused interface and wiring only if those obligations survive.

**Before:** `makeUserRepository()` returns the sole `UserRepositoryAdapter`, which simply calls the database client. **After:** Inject/use the database-backed repository directly if the factory and adapter neither own a transaction nor shield a supported implementation boundary. Keep a transaction-owning repository even with one backend.

### Duplicate state, caches, and derived flags

**Apply:** Two fields encode the same fact and are updated together, or a cache costs more complexity than the computation it saves. **Payoff:** One source of truth and fewer invalidation, synchronization, and race paths. **Keep when:** The second representation captures a distinct snapshot, version, security boundary, event history, offline state, or measured performance need. **Prove:** Enumerate all constructors, mutations, readers, persistence/serialization, concurrency and lifetime boundaries; show the remaining state yields the same values and ordering. A derived getter may be safer than maintaining a boolean, but can change cost or visibility if the source mutates.

**Before:** A session keeps `entries` and a manually updated `entryCount` used only for display. **After:** Read `entries.length`/the collection size, provided no separate snapshot or expensive counting contract exists. Do not remove a count maintained for a large remote collection without measuring the resulting query.

### Representation and schema ping-pong

**Apply:** Data is repeatedly converted among near-identical internal shapes or independently maintained schemas with the same owner and invariants. **Payoff:** Fewer mapping paths and fewer drift bugs. **Keep when:** A wire DTO, database schema, domain type, privacy filter, versioned format, or untrusted-input parser intentionally has a different contract. **Prove:** Compare fields, defaults, omission/null behavior, mutation, validation, visibility, versioning and ownership at every boundary. Derive a type or schema from one source only if the same authority controls both sides; do not treat a runtime parser as interchangeable with a static type.

**Before:** Internal `ActiveOrder` is copied into `PreparedOrder` and back solely to rename identical fields. **After:** Use one internal shape and remove both copy functions. Keep a separate public response mapper if it intentionally excludes billing data.

### Duplicate policy versus distinct domains

**Apply:** Two implementations actually decide the same rule for the same population, and one can become the shared authority without coupling unrelated domains. **Payoff:** Fix policy once and remove divergent branches. **Keep when:** Similar-looking checks implement different tenancy, authorization, locale, regulatory, consistency, or product rules; a generic function with many toggles may be harder to understand than two clear policies. **Prove:** Compare the complete input domain, precedence, error result, ownership and change cadence, then exercise representative positive and negative cases at each consumer boundary.

**Before:** Three HTTP handlers independently compute the same request-size limit. **After:** Use the existing shared ingress policy once, preserving each handler's response semantics. Do not unify an upload size limit with a billing threshold because both compare numbers.

## Remove work without hiding it

### Existing, standard, or native capability

**Apply:** A local helper duplicates a mature existing facility and the facility's behavior fits the real contract. **Payoff:** Less algorithm and edge-case code to own. **Keep when:** The replacement changes encoding, locale, ordering, error precedence, accessibility, cancellation, platform support, security, or product behavior. **Prove:** Compare representative and adversarial inputs through the actual entry point on supported versions; inspect dependency and platform guarantees. Choose an already-used facility only after semantics match, not just because it is installed.

**Before:** A handwritten query-string encoder duplicates the platform API's supported encoding contract. **After:** Use the platform's URL/query API after comparing spaces, reserved characters, repeated keys and ordering. If the old encoder mishandles a supported input, correcting it changes behavior: identify the bug and obtain any required authorization separately rather than claiming equivalence. A native date input is not an automatic replacement for a custom picker with different keyboard and locale requirements.

### Algorithmic work and allocations

**Apply:** The current path scans, copies, sorts, serializes, allocates, retries, or recomputes data that the result does not require. **Payoff:** Less resource use and possibly simpler ownership. **Keep when:** A copy prevents aliasing, sorting defines a public order, a retry protects a transient failure contract, or the extra work establishes validation/security. **Prove:** Trace consumers and mutation/ownership, check error and ordering behavior, and measure under representative inputs if claiming speed, memory, or allocation gains. Avoid trading a clear linear pass for a dense expression or a worse algorithm just to save lines.

**Before:** To answer `contains(id)`, code copies and sorts the entire list, then searches it. **After:** Scan until the first match if ordering and subsequent mutation are irrelevant. Conversely, don't replace a deliberate snapshot copy with an alias to mutable shared storage.

### Control flow and error paths

**Apply:** Repeated branches perform the same action, nested conditions obscure a single exit, or an error is wrapped and unwrapped without adding meaning. **Payoff:** Fewer paths to reason about. **Keep when:** Branch order, exact error category, cleanup timing, telemetry relied on by operators, or distinct recovery actions are observable. **Prove:** Make a branch table including malformed input, failure precedence, side effects, cleanup, cancellation and retries; compare old and new behavior. Use named intermediate values and explicit branches if they make the rule easier to read than a compact chain.

**Before:** Every allowed status case separately returns the same response; combine those cases under a clearly named predicate. Do not collapse `unauthorized` and `not found` into one generic error merely because both return early.

### Build-time indirection, generated code, and macros

**Apply:** Generation or metaprogramming exists only to produce a small stable shape and imposes more generator, template, build and debugging work than direct code would. **Payoff:** Fewer moving parts and build-time failure modes. **Keep when:** Generated output is mandated by a protocol/schema, handles substantial repetition, or guards cross-language drift. **Prove:** Compare the total maintained surface: inputs, templates, output, build scripts, supported targets, regeneration rules and callers. Verify the replacement under each supported build configuration. Moving handwritten code into a generator is not a reduction.

### Tests, fixtures, and docs

**Apply:** A responsibility is genuinely retired, or an assertion/fixture only pins obsolete internal wiring or duplicates stronger surviving evidence. **Payoff:** Less brittle maintenance without reducing contract coverage. **Keep when:** It uniquely detects a plausible boundary, failure, security, concurrency, lifecycle or integration regression; governing project policy may prohibit test retirement altogether. **Prove:** Inventory obligations per assertion, not per file; keep, migrate, retire or block each one under [proof and tests](proof-and-tests.md). Remove only fixtures and docs tied solely to a retired contract; update examples and generated docs describing the new public path. A lower test count by itself is no win.

## Agent-produced excess to challenge

Look for fallback branches with no supported failure mode, `async` where nothing can suspend, retries with no transient-failure policy, caches without measured need, `Result`/error wrappers that only repackage a guaranteed internal value, and dependency injection frameworks where direct construction suffices. These are candidates, not anti-patterns by definition. Apply the corresponding state, control-flow, wrapper, or dependency proof above: name the supported contract, trace exceptional and lifecycle paths, then delete the machinery only if the contract remains true. In particular, a typed internal invariant does not validate network input, an optional cache can still enforce rate limits, and a retry may be required to survive transient storage failure. The win is fewer obligations to maintain, not a heroic one-liner.
