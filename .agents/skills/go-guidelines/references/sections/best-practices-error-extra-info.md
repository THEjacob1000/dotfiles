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

<a id="error-extra-info"></a>

### Adding information to errors

When adding information to errors, avoid redundant information that the
underlying error already provides. The `os` package, for instance, already
includes path information in its errors.

```go
// Good:
if err := os.Open("settings.txt"); err != nil {
  return fmt.Errorf("launch codes unavailable: %v", err)
}

// Output:
//
// launch codes unavailable: open settings.txt: no such file or directory
```

Here, "launch codes unavailable" adds specific meaning to the `os.Open` error
that's relevant to the current function's context, without duplicating the
underlying file path information.

```go
// Bad:
if err := os.Open("settings.txt"); err != nil {
  return fmt.Errorf("could not open settings.txt: %v", err)
}

// Output:
//
// could not open settings.txt: open settings.txt: no such file or directory
```

Don't add an annotation if its sole purpose is to indicate a failure without
adding new information. The presence of an error sufficiently conveys the
failure to the caller.

```go
// Bad:
return fmt.Errorf("failed: %v", err) // just return err instead
```

The
[choice between `%v` and `%w` when wrapping errors](https://go.dev/blog/go1.13-errors#whether-to-wrap)
with `fmt.Errorf` is a nuanced decision that significantly impacts how errors
are propagated handled, inspected, and documented within your application. The
core principle is to make error values useful to their observers, whether those
observers are humans or code.

1.  **`%v` for simple annotation or new error**

    The `%v` verb is your general-purpose tool for string formatting of any Go
    value, including errors. When used with `fmt.Errorf`, it embeds the string
    representation of an error (what its `Error()` method returns) into a new
    error value, dropping any structured information from the original error.
    Examples to use `%v`:

    *   Adding interesting, non-redundant context: as in the example above.

    *   Logging or displaying errors: When the primary goal is to present a
        human-readable error message in logs or to a user, and you don't intend
        for the caller to programmatically `errors.Is` or `errors.As` the error
        (Note: `errors.Unwrap` is generally not recommended here as it doesn't
        handle multi-errors).

    *   Creating fresh, independent errors: Sometimes it is necessary to
        transform an error into a new error message, thereby hiding the
        specifics of the original error. This practice is particularly
        beneficial at system boundaries, including but not limited to RPC, IPC,
        and storage, where we translate domain-specific errors into a canonical
        error space.

        ```go
        // Good:
        func (*FortuneTeller) SuggestFortune(context.Context, *pb.SuggestionRequest) (*pb.SuggestionResponse, error) {
          // ...
          if err != nil {
            return nil, fmt.Errorf("couldn't find fortune database: %v", err)
          }
        }
        ```

        We could also explicitly annotate RPC code `Internal` to the example
        above.

        ```go
        // Good:
        import (
          "google.golang.org/grpc/codes"
          "google.golang.org/grpc/status"
        )

        func (*FortuneTeller) SuggestFortune(context.Context, *pb.SuggestionRequest) (*pb.SuggestionResponse, error) {
          // ...
          if err != nil {
            // Or use fmt.Errorf with the %w verb if deliberately wrapping an
            // error which the caller is meant to unwrap.
            return nil, status.Errorf(codes.Internal, "couldn't find fortune database", status.ErrInternal)
          }
        }
        ```

1.  **`%w` (wrap) for programmatic inspection and error chaining**

    The `%w` verb is specifically designed for error wrapping. It creates a new
    error that provides an `Unwrap()` method, allowing callers to
    programmatically inspect the error chain using `errors.Is` and `errors.As`.
    Examples to use `%w`:

    *   Adding context while preserving the original error for programmatic
        inspection: This is the primary use case within helpers of your
        application. You want to enrich an error with additional context (e.g.,
        what operation was being performed when it failed) but still allow the
        caller to check if the underlying error is a specific sentinel error or
        type.

        ```go
        // Good:
        func (s *Server) internalFunction(ctx context.Context) error {
          // ...
          if err != nil {
            return fmt.Errorf("couldn't find remote file: %w", err)
          }
        }
        ```

        This allows a higher-level function to do `errors.Is(err,
        fs.ErrNotExist)` if the underlying error was `fs.ErrNotExist`, even
        though it's wrapped.

        At points where your system interacts with external systems like RPC,
        IPC, or storage, it's often better to translate domain-specific errors
        into a standardized error space (e.g., gRPC status codes) rather than
        simply wrapping the raw underlying error with `%w`. The client typically
        doesn't care about the exact internal file system error; they care about
        the canonical result (e.g., `Internal`, `NotFound`, `PermissionDenied`).

    *   When you explicitly document and test the underlying errors you expose:
        If your package's API guarantees that certain underlying errors can be
        unwrapped and checked by callers (e.g., "this function might return
        `ErrInvalidConfig` wrapped within a more general error"), then `%w` is
        appropriate. This forms part of your package's contract.

See also:

*   [Error Documentation Conventions](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#documentation-conventions-errors)
*   [Blog post on error wrapping](https://blog.golang.org/go1.13-errors)

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#error-extra-info. Locally segmented; local links rewritten to this pinned revision. -->
