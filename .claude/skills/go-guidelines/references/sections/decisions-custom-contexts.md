## Common libraries

<a id="contexts"></a>

### Contexts

<a id="TOC-Contexts"></a>

Values of the [`context.Context`] type carry security credentials, tracing
information, deadlines, and cancellation signals across API and process
boundaries. Unlike C++ and Java, which in the Google codebase use thread-local
storage, Go programs pass contexts explicitly along the entire function call
chain from incoming RPCs and HTTP requests to outgoing requests.

[`context.Context`]: https://pkg.go.dev/context

When passed to a function or method, [`context.Context`] is always the first
parameter.

```go
func F(ctx context.Context /* other arguments */) {}
```

Exceptions are:

*   In an HTTP handler, where the context comes from
    [`req.Context()`](https://pkg.go.dev/net/http#Request.Context).
*   In streaming RPC methods, where the context comes from the stream.

    Code using gRPC streaming accesses a context from a `Context()` method in
    the generated server type, which implements `grpc.ServerStream`. See
    [gRPC Generated Code documentation](https://grpc.io/docs/languages/go/generated-code/).

*   In test functions (e.g. `TestXXX`, `BenchmarkXXX`, `FuzzXXX`), where the
    context comes from
    [`(testing.TB).Context()`](https://pkg.go.dev/testing#TB.Context).

*   In other entrypoint functions (see below for examples of such functions),
    use [`context.Background()`].

    *   In binary targets: `main`
    *   In general purpose code and libraries: `init`

> **Note**: It is very rare for code in the middle of a callchain to require
> creating a base context of its own using [`context.Background()`]. Always
> prefer taking a context from your caller, unless it's the wrong context.
>
> You may come across server libraries (the implementation of Stubby, gRPC, or
> HTTP in Google's server framework for Go) that construct a fresh context
> object per request. These contexts are immediately filled with information
> from the incoming request, so that when passed to the request handler, the
> context's attached values have been propagated to it across the network
> boundary from the client caller. Moreover, these contexts' lifetimes are
> scoped to that of the request: when the request is finished, the context is
> cancelled.
>
> Unless you are implementing a server framework, you shouldn't create contexts
> with [`context.Background()`] in library code. Instead, prefer using context
> detachment, which is mentioned below, if there is an existing context
> available. If you think you do need [`context.Background()`] outside of
> entrypoint functions, discuss it with the Google Go style mailing list before
> committing to an implementation.

The convention that [`context.Context`] comes first in functions also applies to
test helpers.

```go
// Good:
func readTestFile(ctx context.Context, t *testing.T, path string) string {}
```

Do not add a context member to a struct type. Instead, add a context parameter
to each method on the type that needs to pass it along. The one exception is for
methods whose signature must match an interface in the standard library or in a
third party library outside Google's control. Such cases are very rare, and
should be discussed with the Google Go style mailing list before implementation
and readability review.

**Note:** Go 1.24 added a [`(testing.TB).Context()`] method. In tests, prefer
using [`(testing.TB).Context()`] over [`context.Background()`] to provide the
initial [`context.Context`] used by the test. Helper functions, environment or
test double setup, and other functions called from the test function body that
require a context should have one explicitly passed.

[`(testing.TB).Context()`]: https://pkg.go.dev/testing#TB.Context

Code in the Google codebase that must spawn background operations which can run
after the parent context has been cancelled can use an internal package for
detachment. Follow [issue #40221](https://github.com/golang/go/issues/40221) for
discussions on an open source alternative.

Since contexts are immutable, it is fine to pass the same context to multiple
calls that share the same deadline, cancellation signal, credentials, parent
trace, and so on.

See also:

*   [Contexts and structs]

[`context.Background()`]: https://pkg.go.dev/context/#Background
[Contexts and structs]: https://go.dev/blog/context-and-structs

<a id="custom-contexts"></a>

#### Custom contexts

Do not create custom context types or use interfaces other than
[`context.Context`] in function signatures. There are no exceptions to this
rule.

Imagine if every team had a custom context. Every function call from package `p`
to package `q` would have to determine how to convert a `p.Context` to a
`q.Context`, for all pairs of packages `p` and `q`. This is impractical and
error-prone for humans, and it makes automated refactorings that add context
parameters nearly impossible.

If you have application data to pass around, put it in a parameter, in the
receiver, in globals, or in a `Context` value if it truly belongs there.
Creating your own context type is not acceptable since it undermines the ability
of the Go team to make Go programs work properly in production.

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#custom-contexts. Locally segmented; local links rewritten to this pinned revision. -->
