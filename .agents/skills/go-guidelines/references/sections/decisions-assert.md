<a id="useful-test-failures"></a>

## Useful test failures

<a id="TOC-UsefulTestFailures"></a>

It should be possible to diagnose a test's failure without reading the test's
source. Tests should fail with helpful messages detailing:

*   What caused the failure
*   What inputs resulted in an error
*   The actual result
*   What was expected

Specific conventions for achieving this goal are outlined below.

<a id="assert"></a>

### Assertion libraries

<a id="TOC-Assert"></a>

Do not create "assertion libraries" as helpers for testing.

Assertion libraries are libraries that attempt to combine the validation and
production of failure messages within a test (though the same pitfalls can apply
to other test helpers as well). For more on the distinction between test helpers
and assertion libraries, see [best practices](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#test-functions).

```go
// Bad:
var obj BlogPost

assert.IsNotNil(t, "obj", obj)
assert.StringEq(t, "obj.Type", obj.Type, "blogPost")
assert.IntEq(t, "obj.Comments", obj.Comments, 2)
assert.StringNotEq(t, "obj.Body", obj.Body, "")
```

Assertion libraries tend to either stop the test early (if `assert` calls
`t.Fatalf` or `panic`) or omit relevant information about what the test got
right:

```go
// Bad:
package assert

func IsNotNil(t *testing.T, name string, val any) {
    if val == nil {
        t.Fatalf("Data %s = nil, want not nil", name)
    }
}

func StringEq(t *testing.T, name, got, want string) {
    if got != want {
        t.Fatalf("Data %s = %q, want %q", name, got, want)
    }
}
```

Complex assertion functions often do not provide [useful failure messages] and
context that exists within the test function. Too many assertion functions and
libraries lead to a fragmented developer experience: which assertion library
should I use, what style of output format should it emit, etc.? Fragmentation
produces unnecessary confusion, especially for library maintainers and authors
of large-scale changes, who are responsible for fixing potential downstream
breakages. Instead of creating a domain-specific language for testing, use Go
itself.

Assertion libraries often factor out comparisons and equality checks. Prefer
using standard libraries such as [`cmp`] and [`fmt`] instead:

```go
// Good:
var got BlogPost

want := BlogPost{
    Comments: 2,
    Body:     "Hello, world!",
}

if !cmp.Equal(got, want) {
    t.Errorf("Blog post = %v, want = %v", got, want)
}
```

For more domain-specific comparison helpers, prefer returning a value or an
error that can be used in the test's failure message instead of passing
`*testing.T` and calling its error reporting methods:

```go
// Good:
func postLength(p BlogPost) int { return len(p.Body) }

func TestBlogPost_VeritableRant(t *testing.T) {
    post := BlogPost{Body: "I am Gunnery Sergeant Hartman, your senior drill instructor."}

    if got, want := postLength(post), 60; got != want {
        t.Errorf("Length of post = %v, want %v", got, want)
    }
}
```

**Best Practice:** Were `postLength` non-trivial, it would make sense to test it
directly, independently of any tests that use it.

See also:

*   [Equality comparison and diffs](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#types-of-equality)
*   [Print diffs](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#print-diffs)
*   For more on the distinction between test helpers and assertion helpers, see
    [best practices](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#test-functions)
*   [Go FAQ] section on [testing frameworks] and their opinionated absence

[useful failure messages]: https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#useful-test-failures
[`fmt`]: https://golang.org/pkg/fmt/
[marking test helpers]: https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#mark-test-helpers
[Go FAQ]: https://go.dev/doc/faq
[testing frameworks]: https://go.dev/doc/faq#testing_framework

[`cmp`]: https://pkg.go.dev/github.com/google/go-cmp/cmp

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#assert. Locally segmented; local links rewritten to this pinned revision. -->
