# correctness

Read the relevant [Google sections](google.md) first. The rules below supplement them; local policy and Google win conflicts. Paths are relative to this index.

Community reference: [dependability](../rust-api-guidelines/src/dependability.md). Read only the relevant sections and compatible Microsoft additions below.

For unsafe code, also read the [Reference UB rules](../rust-reference/src/behavior-considered-undefined.md) and [unsafety](../rust-reference/src/unsafety.md).

- [M-PANIC-CONTINUATION: Panic continuation is last resort](../microsoft/src/guidelines/correctness/M-PANIC-CONTINUATION.md)
- [M-PANIC-IS-STOP: Panic means 'stop the program'](../microsoft/src/guidelines/correctness/M-PANIC-IS-STOP.md)
- [M-PANIC-MESSAGE: Custom panics have a helpful message](../microsoft/src/guidelines/correctness/M-PANIC-MESSAGE.md)
- [M-PANIC-ON-BUG: Detected programming bugs are panics, not errors](../microsoft/src/guidelines/correctness/M-PANIC-ON-BUG.md)
- [M-UNSAFE-IMPLIES-UB: Unsafe implies undefined behavior](../microsoft/src/guidelines/correctness/M-UNSAFE-IMPLIES-UB.md)
- [M-UNSAFE: Unsafe needs reason, should be avoided](../microsoft/src/guidelines/correctness/M-UNSAFE.md)
- [M-UNSOUND: All code must be sound](../microsoft/src/guidelines/correctness/M-UNSOUND.md)
