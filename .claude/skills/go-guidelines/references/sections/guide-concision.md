<a id="principles"></a>

## Style principles

There are a few overarching principles that summarize how to think about writing
readable Go code. The following are attributes of readable code, in order of
importance:

1.  **[Clarity]**: The code's purpose and rationale is clear to the reader.
1.  **[Simplicity]**: The code accomplishes its goal in the simplest way
    possible.
1.  **[Concision]**: The code has a high signal-to-noise ratio.
1.  **[Maintainability]**: The code is written such that it can be easily
    maintained.
1.  **[Consistency]**: The code is consistent with the broader Google codebase.

[Clarity]: https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#clarity
[Simplicity]: https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#simplicity
[Concision]: https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#concision
[Maintainability]: https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#maintainability
[Consistency]: https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#consistency

<a id="concision"></a>

### Concision

Concise Go code has a high signal-to-noise ratio. It is easy to discern the
relevant details, and the naming and structure guide the reader through these
details.

There are many things that can get in the way of surfacing the most salient
details at any given time:

*   Repetitive code
*   Extraneous syntax
*   [Opaque names](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#naming)
*   Unnecessary abstraction
*   Whitespace

Repetitive code especially obscures the differences between each
nearly-identical section, and requires a reader to visually compare similar
lines of code to find the changes. [Table-driven testing] is a good example of a
mechanism that can concisely factor out the common code from the important
details of each repetition, but the choice of which pieces to include in the
table will have an impact on how easy the table is to understand.

When considering multiple ways to structure code, it is worth considering which
way makes important details the most apparent.

Understanding and using common code constructions and idioms are also important
for maintaining a high signal-to-noise ratio. For example, the following code
block is very common in [error handling], and the reader can quickly understand
the purpose of this block.

```go
// Good:
if err := doSomething(); err != nil {
    // ...
}
```

If code looks very similar to this but is subtly different, a reader may not
notice the change. In cases like this, it is worth intentionally ["boosting"]
the signal of the error check by adding a comment to call attention to it.

```go
// Good:
if err := doSomething(); err == nil { // if NO error
    // ...
}
```

[Table-driven testing]: https://go.dev/wiki/TableDrivenTests
[error handling]: https://go.dev/blog/errors-are-values
["boosting"]: https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#signal-boost

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#concision. Locally segmented; local links rewritten to this pinned revision. -->
