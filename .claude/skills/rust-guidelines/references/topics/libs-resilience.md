# libs/resilience

Read the rules relevant to the current change. Paths are relative to this index.

Baseline: [type safety](../rust-api-guidelines/src/type-safety.md), [dependability](../rust-api-guidelines/src/dependability.md). Read the relevant sections alongside the Microsoft rules below.

- [M-AVOID-STATICS: Avoid statics](../microsoft/src/guidelines/libs/resilience/M-AVOID-STATICS.md)
- [M-BUILD-RESULT: Builders validate in final `.build()`](../microsoft/src/guidelines/libs/resilience/M-BUILD-RESULT.md)
- [M-INTEGRATION-TESTS: Integration tests live under `tests/`](../microsoft/src/guidelines/libs/resilience/M-INTEGRATION-TESTS.md)
- [M-LOG-NOT-PRINT: Production code uses telemetry, not println](../microsoft/src/guidelines/libs/resilience/M-LOG-NOT-PRINT.md)
- [M-MOCKABLE-SYSCALLS: I/O and system calls are mockable](../microsoft/src/guidelines/libs/resilience/M-MOCKABLE-SYSCALLS.md)
- [M-NO-GLOB-REEXPORTS: Don't glob re-export items](../microsoft/src/guidelines/libs/resilience/M-NO-GLOB-REEXPORTS.md)
- [M-STRONG-TYPES-GUARD: Newtypes guard their invariants](../microsoft/src/guidelines/libs/resilience/M-STRONG-TYPES-GUARD.md)
- [M-STRONG-TYPES: Use the proper type family](../microsoft/src/guidelines/libs/resilience/M-STRONG-TYPES.md)
- [M-TEST-UTIL: Test utilities are feature gated](../microsoft/src/guidelines/libs/resilience/M-TEST-UTIL.md)
