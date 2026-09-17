<a id="errors"></a>

## Errors

<a id="handle-errors"></a>

### Handle errors

<a id="TOC-HandleErrors"></a>

Code that encounters an error should make a deliberate choice about how to
handle it. It is not usually appropriate to discard errors using `_` variables.
If a function returns an error, do one of the following:

*   Handle and address the error immediately.
*   Return the error to the caller.
*   In exceptional situations, call [`log.Fatal`] or (if absolutely necessary)
    `panic`.

**Note:** `log.Fatalf` is not the standard library log. See [#logging].

In the rare circumstance where it is appropriate to ignore or discard an error
(for example a call to [`(*bytes.Buffer).Write`] that is documented to never
fail), an accompanying comment should explain why this is safe.

```go
// Good:
var b *bytes.Buffer

n, _ := b.Write(p) // never returns a non-nil error
```

For more discussion and examples of error handling, see
[Effective Go](http://golang.org/doc/effective_go.html#errors) and
[best practices](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#error-handling).

[`(*bytes.Buffer).Write`]: https://pkg.go.dev/bytes#Buffer.Write

[`log.Fatal`]: https://pkg.go.dev/github.com/golang/glog#Fatal

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#handle-errors. Locally segmented; local links rewritten to this pinned revision. -->
