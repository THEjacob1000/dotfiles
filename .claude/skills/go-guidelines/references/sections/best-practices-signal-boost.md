<a id="documentation"></a>

## Documentation

<a id="signal-boost"></a>

### Signal boosting

Sometimes a line of code looks like something common, but actually isn't. One of
the best examples of this is an `err == nil` check (since `err != nil` is much
more common). The following two conditional checks are hard to distinguish:

```go
// Good:
if err := doSomething(); err != nil {
    // ...
}
```

```go
// Bad:
if err := doSomething(); err == nil {
    // ...
}
```

You can instead "boost" the signal of the conditional by adding a comment:

```go
// Good:
if err := doSomething(); err == nil { // if NO error
    // ...
}
```

The comment draws attention to the difference in the conditional.

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#signal-boost. Locally segmented; local links rewritten to this pinned revision. -->
