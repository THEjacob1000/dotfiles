---
name: error-cleanup
description: Systematically fix type errors, lint errors, and failing tests. Use when the user says "fix the type errors", "fix the lint errors", "tests are failing", "clean up the errors", "make the build green", or after your own edits introduced errors. Enforces root-cause fixes, never suppressions.
generated-by: numen-sync
---

# Error Cleanup

Goal: a genuinely green gate, not a silenced one.

## 1. Inventory first
Run the full gate to get the complete error list before fixing anything (use the repo's own scripts; prefer `test:ci` over `test` if it exists):
- `bun run typecheck` (or `tsc --noEmit`), `bun run lint`, `bun test` / `bun run test:ci`, or the repo's Go/Rust/Flutter equivalents (`go build ./... && go vet ./...`, `cargo check && cargo clippy`, `dart analyze && flutter test`).

## 2. Group by root cause
Cluster errors by cause, not by file. One missing type export can produce 50 diagnostics. Fix causes in dependency order (shared packages → apps).

## 3. Forbidden "fixes"
Never, under any circumstances:
- `// @ts-ignore`, `// @ts-expect-error`, `biome-ignore`/eslint-disable comments, or editing lint config to drop a rule
- Casting through `any` / `as any` / `as unknown as` to silence the checker
- Commenting out assertions, `.skip`-ing tests, deleting tests, or loosening expectations to make them pass
- Widening a type to `unknown`/`any` when a precise type is derivable

If a rule/test seems genuinely wrong, fix the code anyway and flag the rule to the user separately.

## 4. Known gotchas (from this user's history)
- `TS2307: Cannot find module 'bun:test' or its corresponding type declarations` → the tsconfig is missing bun types. Copy the setup from a working sibling app in the monorepo (`"types": ["bun-types"]` or a `bun-env.d.ts` reference). Don't hand-roll declarations.
- Monorepo type errors often mean a dependent package needs rebuilding first, so check for a `build`/`generate` step in the failing package's dependencies.
- Mock-related failures (`X is not a function`) usually mean the test's mock is missing a newly added method. Extend the mock, don't weaken the assertion.

## 5. Verify and report
Re-run the complete gate (typecheck + lint + tests) at the end, even if you only touched one category, fixes leak across categories. Report actual final numbers (0 type errors, 0 lint errors, N/N tests passing). If anything still fails, say so explicitly with the output.
