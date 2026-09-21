# correctness

Read the rules relevant to the current change. Paths are relative to this index.

Baseline: [dependability](../rust-api-guidelines/src/dependability.md). Read the relevant sections alongside the Microsoft rules below.

For unsafe code, also read the [Reference UB rules](../rust-reference/src/behavior-considered-undefined.md) and [unsafety](../rust-reference/src/unsafety.md).

- [M-PANIC-CONTINUATION: Panic continuation is last resort](../microsoft/src/guidelines/correctness/M-PANIC-CONTINUATION.md)
- [M-PANIC-IS-STOP: Panic means 'stop the program'](../microsoft/src/guidelines/correctness/M-PANIC-IS-STOP.md)
- [M-PANIC-MESSAGE: Custom panics have a helpful message](../microsoft/src/guidelines/correctness/M-PANIC-MESSAGE.md)
- [M-PANIC-ON-BUG: Detected programming bugs are panics, not errors](../microsoft/src/guidelines/correctness/M-PANIC-ON-BUG.md)
- [M-UNSAFE-IMPLIES-UB: Unsafe implies undefined behavior](../microsoft/src/guidelines/correctness/M-UNSAFE-IMPLIES-UB.md)
- [M-UNSAFE: Unsafe needs reason, should be avoided](../microsoft/src/guidelines/correctness/M-UNSAFE.md)
- [M-UNSOUND: All code must be sound](../microsoft/src/guidelines/correctness/M-UNSOUND.md)
