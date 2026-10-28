# libs/interop

Read the relevant [Google sections](google.md) first. The rules below supplement them; local policy and Google win conflicts. Paths are relative to this index.

Community reference: [interoperability](../rust-api-guidelines/src/interoperability.md), [flexibility](../rust-api-guidelines/src/flexibility.md). Read only the relevant sections and compatible Microsoft additions below.

- [M-DONT-LEAK-TYPES: Don't leak external types](../microsoft/src/guidelines/libs/interop/M-DONT-LEAK-TYPES.md)
- [M-ESCAPE-HATCHES: Native escape hatches](../microsoft/src/guidelines/libs/interop/M-ESCAPE-HATCHES.md)
- [M-FOREIGN-REEXPORTS: Items come from their original crate](../microsoft/src/guidelines/libs/interop/M-FOREIGN-REEXPORTS.md)
- [M-IMPL-ASREF: Accept `impl AsRef<>` where feasible](../microsoft/src/guidelines/libs/interop/M-IMPL-ASREF.md)
- [M-IMPL-IO: Accept `impl 'IO'` where feasible ('sans IO')](../microsoft/src/guidelines/libs/interop/M-IMPL-IO.md)
- [M-IMPL-RANGEBOUNDS: Accept `impl RangeBounds<>` where feasible](../microsoft/src/guidelines/libs/interop/M-IMPL-RANGEBOUNDS.md)
- [M-TYPES-SEND: Types are Send](../microsoft/src/guidelines/libs/interop/M-TYPES-SEND.md)
