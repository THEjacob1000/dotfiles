<a id="language"></a>

## Language

<a id="indentation-confusion"></a>

### Indentation confusion

Avoid introducing a line break if it would align the rest of the line with an
indented code block. If this is unavoidable, leave a space to separate the code
in the block from the wrapped line.

```go
// Bad:
if longCondition1 && longCondition2 &&
    // Conditions 3 and 4 have the same indentation as the code within the if.
    longCondition3 && longCondition4 {
    log.Info("all conditions met")
}
```

See the following sections for specific guidelines and examples:

*   [Function formatting](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#func-formatting)
*   [Conditionals and loops](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#conditional-formatting)
*   [Literal formatting](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#literal-formatting)

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#indentation-confusion. Locally segmented; local links rewritten to this pinned revision. -->
