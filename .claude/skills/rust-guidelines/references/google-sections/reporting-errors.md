Google Rust Style Guide excerpt: `reporting-errors`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="reporting-errors"></a>

### Reporting errors

Choose the error reporting mechanism that fits your API contract: `Option`,
`Result`, or `panic!`.

**Use `Option` for simple failures** where the cause is obvious and the caller
would not benefit from further details. This is best for standard, anticipated
outcomes like a missing value or a parsing mismatch.

<div class='goodcode'></div>

```rust
// Good: The cause of the failure is obvious (integer overflow). No further
// details could be reasonably provided.
fn checked_add(a: u32, b: u32) -> Option<u32> { ... }
```

**Use `Result` for recoverable failures where the caller needs context** to
handle the error. These are often "unavoidable" errors caused by external
factors (like I/O or network) that even correctly implemented code cannot
prevent with checks ahead of time. Nevertheless, the caller can reasonably
anticipate the kinds of errors (a file-related function can fail with an I/O
error). The error details allow the caller to distinguish failure modes and
recover appropriately.

<div class='goodcode'></div>

```rust
// Good: The caller needs to know *why* it failed (NotFound vs PermissionDenied).
fn open_file(path: &Path) -> Result<File, io::Error> { ... }
```

**Use `panic!` to report bugs and violated invariants.** These errors are
avoidable: the program is missing a check, and is calling an operation without
fulfilling a precondition. These defects must be fixed in the code, not handled
at runtime, although coarse-grained recovery might be possible with
`catch_unwind`.

<div class='goodcode'></div>

```rust
// Good: Panics if the invariant (index must be in bounds) is violated.
// This indicates a bug in the caller's logic.
impl<T> MyVec<T> {
    pub fn remove(&mut self, index: usize) -> T {
        if index >= self.len() {
            panic!("index out of bounds");
        }
        // ...
    }
}
```

Note: Some codebases may choose to avoid panics entirely, and require even
broken invariants to be reported via `Result`.

Exceptions:

*   Developer-facing binaries may use panics for non-fatal errors.
*   Tests may use panics for assertions.
