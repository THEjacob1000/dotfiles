<a id="errors"></a>

## Errors

<a id="returning-errors"></a>

### Returning errors

<a id="TOC-ReturningErrors"></a>

Use `error` to signal that a function can fail. By convention, `error` is the
last result parameter.

```go
// Good:
func Good() error { /* ... */ }
```

Returning a `nil` error is the idiomatic way to signal a successful operation
that could otherwise fail. If a function returns an error, callers must treat
all non-error return values as unspecified unless explicitly documented
otherwise. Commonly, the non-error return values are their zero values, but this
cannot be assumed.

```go
// Good:
func GoodLookup() (*Result, error) {
    // ...
    if err != nil {
        return nil, err
    }
    return res, nil
}
```

Exported functions that return errors should return them using the `error` type.
Concrete error types are susceptible to subtle bugs: a concrete `nil` pointer
can get wrapped into an interface and thus become a non-nil value (see the
[Go FAQ entry on the topic][nil error]).

```go
// Bad:
func Bad() *os.PathError { /*...*/ }
```

**Tip:** A function that takes a [`context.Context`] argument should usually
return an `error` so that the caller can determine if the context was cancelled
while the function was running.

[nil error]: https://golang.org/doc/faq#nil_error

[`context.Context`]: https://pkg.go.dev/context

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#returning-errors. Locally segmented; local links rewritten to this pinned revision. -->
