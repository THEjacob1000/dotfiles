---
name: code-golf
description: Default for every coding task, including implementation, fixes, refactoring, review and tests. Deliver the smallest readable, safe solution that satisfies the request across Rust, TypeScript/JavaScript and Go. Not character minification or permission for unrequested cleanup.
generated-by: numen-sync
---

# Code golf

Use this automatically for coding work, without a separate invocation. Minimize what must be built, understood and maintained, not the care needed to get it right. The longer clear implementation wins over a shorter dense one. This is a coding default, not a persistent chat persona or a mandate to simplify unrelated code.

## Do only the necessary work

Keep the user's scope. A small fix stays a small fix; don't turn it into an audit, introduce a framework, clean up neighboring modules, or add configurable machinery for speculative needs. Preserve everything explicitly requested. If the task needs no code, don't write code.

Use the first adequate existing solution: local code or a house pattern, the standard library or native platform, an already-installed dependency, then the smallest clear implementation. Check semantics before reuse. Don't add a dependency for what a few readable lines solve. Remove unnecessary states, duplicate policy, conversions and forwarding layers rather than hiding them elsewhere.

Readability, correctness and safety are hard constraints. No compressed names, nested ternaries, clever chains, type/macro tricks or hidden effects to save lines. Keep a named helper when it makes the domain clearer. Keep real ownership, trust, lifecycle, compatibility and required swappability boundaries, even with one implementation. Don't trade away resource constraints or add avoidable runtime work for a smaller diff.

## Prove the actual change

Understand the affected flow and callers before editing. Preserve observable values, errors, wire formats, side effects, ordering, cancellation, cleanup and concurrency. Compiler checks apply only within their actual construction and mutation boundary; they don't validate network data, deserialization, FFI or runtime authorization. Never suppress a diagnostic, swallow an error, remove a security check or weaken an assertion to make a change pass.

Complete the cutover: migrate every affected caller and remove obsolete helpers, exports and wiring. Verify the changed path and plausible failure cases using the project's tools; retain its required gates. Scale investigation and verification to the actual risk, not a ritual checklist. Don't add permanent test infrastructure when a focused check suffices, but preserve meaningful regression evidence. Benchmark before claiming a performance gain.

Decide tests by obligation: keep, migrate, or retire with evidence and policy permission. A vanished helper doesn't justify deleting its whole test file. Runtime boundary tests remain when an internal state becomes compiler-impossible. A stricter repository no-deletion rule still wins. Report blocked candidates without abandoning other in-scope work; don't invent additional work when the requested task is already satisfied.

## Load detail only when needed

The entry is the default; don't preload the handbook. Open complete relevant sections, not every linked file:

- Hunting a real simplification opportunity: [reduction catalog](references/reductions.md).
- Compiler guarantees, equivalence or test retirement: [proof and tests](references/proof-and-tests.md).
- Language-specific decisions: [Rust](references/rust.md), [TypeScript/JavaScript](references/typescript-javascript.md), [Go](references/go.md). Keep the project's language guidelines in force.
- An explicitly requested audit or sweep: [workflow](references/workflow.md). For combined guideline enforcement and reduction, use `code-refinement`; if it is already orchestrating, stay in its current lane rather than start another sweep.
- Skill maintenance only: [evaluations](references/evaluations.md) and [sources](references/sources.md).

Finish with what changed and why, actual verification, and anything genuinely blocked. No line-count quota, invented measurements, perfection claim or permanent report for a routine edit. Stop when the requested result is clean, safe, readable and verified.
