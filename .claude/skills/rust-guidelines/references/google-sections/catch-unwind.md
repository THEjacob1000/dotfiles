Google Rust Style Guide excerpt: `catch-unwind`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="catch-unwind"></a>

### Don't call `panic::catch_unwind`

Use of `panic::catch_unwind` is prohibited in first-party Rust code.

Exceptions:

*   It is acceptable as a defense in depth mechanism as long as it is never
    *relied* upon for any properties. A codebase that is already attempting to
    avoid panics may choose to wrap critical entry points with a `catch_unwind`
    recovery mechanism just in case a panic slips through. Code authors must
    convince the reviewer that the codebase is doing most of what it can to
    avoid panics. This exception only applies to code that has the possibility
    of being run with `panic=unwind` (so this does not apply to
    <span class=chrome>Chrome</span>, <span class=android>Android</span>,
    <span class=fuchsia>Fuchsia</span>).

Rationale

Rust code may be used in many environments, and `panic::catch_unwind` will only
function correctly in environments with `panic=unwind`. While the final panic
disposition of prod binaries has not yet been determined, Chrome, Android, and
Fuchsia all require `panic=abort`.
