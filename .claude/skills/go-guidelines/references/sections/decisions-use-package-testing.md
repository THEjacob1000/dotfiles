<a id="test-structure"></a>

## Test structure

<a id="use-package-testing"></a>

### Use package `testing`

The Go standard library provides the [`testing` package]. This is the only
testing framework permitted for Go code in the Google codebase. In particular,
[assertion libraries](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#assert) and third-party testing frameworks are not
allowed.

The `testing` package provides a minimal but complete set of functionality for
writing good tests:

*   Top-level tests
*   Benchmarks
*   [Runnable examples](https://blog.golang.org/examples)
*   Subtests
*   Logging
*   Failures and fatal failures

These are designed to work cohesively with core language features like
[composite literal] and [if-with-initializer] syntax to enable test authors to
write [clear, readable, and maintainable tests].

[`testing` package]: https://pkg.go.dev/testing
[composite literal]: https://go.dev/ref/spec#Composite_literals
[if-with-initializer]: https://go.dev/ref/spec#If_statements

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#use-package-testing. Locally segmented; local links rewritten to this pinned revision. -->
