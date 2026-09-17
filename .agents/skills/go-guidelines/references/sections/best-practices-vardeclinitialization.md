<a id="vardecls"></a>

## Variable declarations

<a id="vardeclinitialization"></a>

### Initialization

For consistency, prefer `:=` over `var` when initializing a new variable with a
non-zero value.

```go
// Good:
i := 42
```

```go
// Bad:
var i = 42
```

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#vardeclinitialization. Locally segmented; local links rewritten to this pinned revision. -->
