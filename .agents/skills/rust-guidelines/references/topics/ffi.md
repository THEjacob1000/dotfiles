# ffi

Read the relevant [Google sections](google.md) first. The rules below supplement them; local policy and Google win conflicts. Paths are relative to this index.

Community reference: [type safety](../rust-api-guidelines/src/type-safety.md). Read only the relevant sections and compatible Microsoft additions below.

For unsafe code, also read the [Reference UB rules](../rust-reference/src/behavior-considered-undefined.md) and [unsafety](../rust-reference/src/unsafety.md).

- [M-FFI-NAMING: FFI crates follow established naming conventions](../microsoft/src/guidelines/ffi/M-FFI-NAMING.md)
- [M-FFI-TRANSLATES: Business logic belongs in core crates, FFI only translates](../microsoft/src/guidelines/ffi/M-FFI-TRANSLATES.md)
- [M-ISOLATE-DLL-STATE: Isolate DLL state between FFI libraries](../microsoft/src/guidelines/ffi/M-ISOLATE-DLL-STATE.md)
