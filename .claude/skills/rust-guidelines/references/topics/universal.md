# universal

Read the relevant [Google sections](google.md) first. The rules below supplement them; local policy and Google win conflicts. Paths are relative to this index.

Community reference: [naming](../rust-api-guidelines/src/naming.md), [debuggability](../rust-api-guidelines/src/debuggability.md). Read only the relevant sections and compatible Microsoft additions below.

For error-event ownership, severity and redaction, read [typed errors](../typed-errors.md#diagnostics-are-an-output-boundary).

For formatting and idioms, select a chapter through the [upstream source map](upstream.md).

Fix the model first; never suppress a lint merely to get green. When its premise is false at a site, put `#[expect(lint, reason = "<property that makes this site correct>")]` on the narrowest item. Apply the same standard when writing and reviewing exceptions: the lint name or "false positive" is not a reason. Remove obsolete exceptions and dead code. Panic-family lints (`unwrap_used`, `expect_used`, `panic`, indexing and slicing) follow the [panic policy](../typed-errors.md#panic-policy) and its single production exception.

- [M-DOCUMENTED-MAGIC: Magic values are documented](../microsoft/src/guidelines/universal/M-DOCUMENTED-MAGIC.md)
- [M-LINT-OVERRIDE-EXPECT: Lint overrides should use `#[expect]`](../microsoft/src/guidelines/universal/M-LINT-OVERRIDE-EXPECT.md)
- [M-LOG-STRUCTURED: Use structured logging with message templates](../microsoft/src/guidelines/universal/M-LOG-STRUCTURED.md)
- [M-PUBLIC-DEBUG: Public types are Debug](../microsoft/src/guidelines/universal/M-PUBLIC-DEBUG.md)
- [M-PUBLIC-DISPLAY: Public types meant to be read are Display](../microsoft/src/guidelines/universal/M-PUBLIC-DISPLAY.md)
- [M-REGULAR-FN: Prefer regular over associated functions](../microsoft/src/guidelines/universal/M-REGULAR-FN.md)
- [M-SHORT-NAMES: Names of items are short](../microsoft/src/guidelines/universal/M-SHORT-NAMES.md)
- [M-SMALLER-CRATES: If in doubt, split the crate](../microsoft/src/guidelines/universal/M-SMALLER-CRATES.md), qualified by local [ownership and boundary costs](../design-and-concurrency.md#model-the-operation-not-the-plumbing), not a split-by-default rule
- [M-STATIC-VERIFICATION: Use static verification](../microsoft/src/guidelines/universal/M-STATIC-VERIFICATION.md)
- [M-UPSTREAM-GUIDELINES: Follow the upstream guidelines](../microsoft/src/guidelines/universal/M-UPSTREAM-GUIDELINES.md)
- [M-WEASEL-WORDS: Names are free of weasel words](../microsoft/src/guidelines/universal/M-WEASEL-WORDS.md)
