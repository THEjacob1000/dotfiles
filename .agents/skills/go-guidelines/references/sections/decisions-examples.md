<a id="commentary"></a>

## Commentary

The conventions around commentary (which include what to comment, what style to
use, how to provide runnable examples, etc.) are intended to support the
experience of reading the documentation of a public API. See
[Effective Go](http://golang.org/doc/effective_go.html#commentary) for more
information.

The best practices document's section on [documentation conventions] discusses
this further.

**Best Practice:** Use [doc preview] during development and code review to see
whether the documentation and runnable examples are useful and are presented the
way you expect them to be.

**Tip:** Godoc uses very little special formatting; lists and code snippets
should usually be indented to avoid linewrapping. Apart from indentation,
decoration should generally be avoided.

[doc preview]: https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#documentation-preview
[documentation conventions]: https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#documentation-conventions

<a id="examples"></a>

### Examples

<a id="TOC-Examples"></a>

Packages should clearly document their intended usage. Try to provide a
[runnable example]; examples show up in Godoc. Runnable examples belong in the
test file, not the production source file. See this example ([Godoc], [source]).

[runnable example]: http://blog.golang.org/examples
[Godoc]: https://pkg.go.dev/time#example-Duration
[source]: https://cs.opensource.google/go/go/+/HEAD:src/time/example_test.go

If it isn't feasible to provide a runnable example, example code can be provided
within code comments. As with other code and command-line snippets in comments,
it should follow standard formatting conventions.

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#examples. Locally segmented; local links rewritten to this pinned revision. -->
