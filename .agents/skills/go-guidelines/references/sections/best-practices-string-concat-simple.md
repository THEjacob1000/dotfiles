<a id="string-concat"></a>

## String concatenation

There are several ways to concatenate strings in Go. Some examples include:

*   The "+" operator
*   `fmt.Sprintf`
*   `strings.Builder`
*   `text/template`
*   `safehtml/template`

Though there is no one-size-fits-all rule for which to choose, the following
guidance outlines when each method is preferred.

<a id="string-concat-simple"></a>

### Prefer "+" for simple cases

Prefer using "+" when concatenating few strings. This method is syntactically
the simplest and requires no import.

```go
// Good:
key := "projectid: " + p
```

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#string-concat-simple. Locally segmented; local links rewritten to this pinned revision. -->
