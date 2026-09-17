<a id="error-handling"></a>

## Error handling

In Go, [errors are values]; they are created by code and consumed by code.
Errors can be:

*   Converted into diagnostic information for display to humans
*   Used by the maintainer
*   Interpreted by an end user

Error messages also show up across a variety of different surfaces including log
messages, error dumps, and rendered UIs.

Code that processes (produces or consumes) errors should do so deliberately. It
can be tempting to ignore or blindly propagate an error return value. However,
it is always worth considering whether the current function in the call frame is
positioned to handle the error most effectively. This is a large topic and it is
hard to give categorical advice. Use your judgment, but keep the following
considerations in mind:

*   When creating an error value, decide whether to give it any
    [structure](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#error-structure).
*   When handling an error, consider [adding information](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#error-extra-info)
    that you have but that the caller and/or callee might not.
*   See also guidance on [error logging](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#error-logging).

While it is usually not appropriate to ignore an error, a reasonable exception
to this is when orchestrating related operations, where often only the first
error is useful. Package [`errgroup`] provides a convenient abstraction for a
group of operations that can all fail or be canceled as a group.

[errors are values]: https://go.dev/blog/errors-are-values
[`errgroup`]: https://pkg.go.dev/golang.org/x/sync/errgroup

See also:

*   [Effective Go on errors](https://go.dev/doc/effective_go#errors)
*   [A post by the Go Blog on errors](https://go.dev/blog/go1.13-errors)
*   [Package `errors`](https://pkg.go.dev/errors)
*   [Package `upspin.io/errors`](https://commandcenter.blogspot.com/2017/12/error-handling-in-upspin.html)
*   [GoTip #89: When to Use Canonical Status Codes as Errors](https://google.github.io/styleguide/go/index.html#gotip)
*   [GoTip #48: Error Sentinel Values](https://google.github.io/styleguide/go/index.html#gotip)
*   [GoTip #13: Designing Errors for Checking](https://google.github.io/styleguide/go/index.html#gotip)

<a id="error-structure"></a>

### Error structure

If callers need to interrogate the error (e.g., distinguish different error
conditions), give the error value structure so that this can be done
programmatically rather than having the caller perform string matching. This
advice applies to production code as well as to tests that care about different
error conditions.

The simplest structured errors are unparameterized global values.

```go
type Animal string

var (
    // ErrDuplicate occurs if this animal has already been seen.
    ErrDuplicate = errors.New("duplicate")

    // ErrMarsupial occurs because we're allergic to marsupials outside Australia.
    // Sorry.
    ErrMarsupial = errors.New("marsupials are not supported")
)

func process(animal Animal) error {
    switch {
    case seen[animal]:
        return ErrDuplicate
    case marsupial(animal):
        return ErrMarsupial
    }
    seen[animal] = true
    // ...
    return nil
}
```

The caller can simply compare the returned error value of the function with one
of the known error values:

```go
// Good:
func handlePet(...) {
    switch err := process(an); err {
    case ErrDuplicate:
        return fmt.Errorf("feed %q: %v", an, err)
    case ErrMarsupial:
        // Try to recover with a friend instead.
        alternate = an.BackupAnimal()
        return handlePet(..., alternate, ...)
    }
}
```

The above uses sentinel values, where the error must be equal (in the sense of
`==`) to the expected value. That is perfectly adequate in many cases. If
`process` returns wrapped errors (discussed below), you can use [`errors.Is`].

```go
// Good:
func handlePet(...) {
    switch err := process(an); {
    case errors.Is(err, ErrDuplicate):
        return fmt.Errorf("feed %q: %v", an, err)
    case errors.Is(err, ErrMarsupial):
        // ...
    }
}
```

Do not attempt to distinguish errors based on their string form. (See
[Go Tip #13: Designing Errors for Checking](https://google.github.io/styleguide/go/index.html#gotip)
for more.)

```go
// Bad:
func handlePet(...) {
    err := process(an)
    if regexp.MatchString(`duplicate`, err.Error()) {...}
    if regexp.MatchString(`marsupial`, err.Error()) {...}
}
```

If there is extra information in the error that the caller needs
programmatically, it should ideally be presented structurally. For example, the
[`os.PathError`] type is documented to place the pathname of the failing
operation in a struct field which the caller can easily access.

Other error structures can be used as appropriate, for example a project struct
containing an error code and detail string. [Package `status`][status] is a
common encapsulation; if you choose this approach (which you are not obligated
to do), use [canonical codes]. See
[Go Tip #89: When to Use Canonical Status Codes as Errors](https://google.github.io/styleguide/go/index.html#gotip)
to know if using status codes is the right choice.

[`os.PathError`]: https://pkg.go.dev/os#PathError
[`errors.Is`]: https://pkg.go.dev/errors#Is
[`errors.As`]: https://pkg.go.dev/errors#As
[`package cmp`]: https://pkg.go.dev/github.com/google/go-cmp/cmp
[status]: https://pkg.go.dev/google.golang.org/grpc/status
[canonical codes]: https://pkg.go.dev/google.golang.org/grpc/codes

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#error-structure. Locally segmented; local links rewritten to this pinned revision. -->
