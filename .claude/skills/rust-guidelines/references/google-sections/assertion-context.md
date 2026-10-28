Google Rust Style Guide excerpt: `assertion-context`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="assertion-context"></a>

### Use context strings to clarify assertions

While some assertions are self-explanatory, many benefit from additional context
that clarifies why an assertion is expected to hold, or what caused it to be
violated. Use the optional format string argument for `assert!` to convey this
context.

You should always consider adding context, but particularly in the following
situations:

*   If you're thinking of adding a comment to the assertion. Use a format string
    instead: It has the benefit that it will appear in logs.
*   If you expect failing assertions to be seen by users. In this case, a
    human-readable explanation is more helpful than a Rust expression.
*   If logging a value helps in understanding why the assertion failed.
*   To clarify whether a failing assertion means that
    *   The client misused an API (i.e., they should change their use of the
        API), or
    *   The implementation contains a bug (i.e., the client should file a bug
        report).

Examples

**Explaining why an assertion should hold**

<div class='goodcode'></div>

```rust
    assert!(
        values.is_sorted(),
        "`values` is populated from a `PriorityQueue`, so we expect it to be sorted"
    );
```

**Logging a value to clarify why the assertion failed**

<div class='goodcode'></div>

```rust
assert!(refund > 0, "Refund must be positive, got {refund:?}");
```

**Flagging misuse of an API**

<div class='goodcode'></div>

```rust
impl Database {
    ...

    fn execute_query(&self, query: &str) {
        assert!(self.stream.is_some(), "Call connect() before executing queries");
    }

    ...
}
```

**Don't use the context string merely to repeat the condition**

<div class='badcode'></div>

```rust
assert!(values.is_sorted(), "values should always be sorted");
```
