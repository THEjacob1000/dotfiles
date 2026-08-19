# /coverage-target

Drive test coverage to a stated numeric target (e.g. "get coverage to 95%", "push this to 100%", "improve coverage"). The target is a hard completion criterion. The task is not done until the number is reached with meaningful tests.

# Coverage Target

A stated target ("95%", "100%") is a hard requirement. Do not stop, declare partial success, or ask whether the current number is acceptable. Iterate until reached or genuinely impossible (and if impossible, prove why with the specific uncoverable lines).

## Loop
1. Run coverage with the repo's script (`bun test --coverage` / `test:ci`, `go test -coverprofile=...`, `flutter test --coverage`). Record the baseline number.
2. Rank files by uncovered lines (most uncovered first). Read the uncovered branches, cover behavior not lines.
3. Write real tests: assert outputs, side effects, and error paths. Include failure branches (thrown errors, invalid input, empty results). These are usually the uncovered ones.
4. Re-run coverage. Report the delta each iteration ("82.4% → 88.1%"). Repeat from step 2.

## Techniques
- Giant hard-to-cover files: split into multiple focused modules first, then test each. This user prefers splitting (e.g. message handlers into per-message files) over monolithic test files.
- Unreachable/defensive branches: refactor to make them reachable or remove genuinely dead code. Don't fake coverage with contrived invocations.
- Test factories/builders for repetitive setup; look at how sibling apps in the monorepo structure their tests and match it.

## Forbidden
- Assertion-free tests, snapshot-everything tests, or tests that merely execute code without checking behavior
- Deleting/excluding files from coverage config to raise the percentage
- Lowering the configured threshold
- Declaring done below target ("that's only a 4% increase" is a known failure mode, keep going)

## Report
Final message must state: baseline %, final %, target %, tests added, and any lines that are provably uncoverable (with justification).
