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

<a id="doc-comments"></a>

### Doc comments

<a id="TOC-DocComments"></a>

All top-level exported names must have doc comments, as should unexported type
or function declarations with unobvious behavior or meaning. These comments
should be [full sentences] that begin with the name of the object being
described. An article ("a", "an", "the") can precede the name to make it read
more naturally.

```go
// Good:
// A Request represents a request to run a command.
type Request struct { ...

// Encode writes the JSON encoding of req to w.
func Encode(w io.Writer, req *Request) { ...
```

Doc comments appear in [Godoc](https://pkg.go.dev/) and are surfaced by IDEs,
and therefore should be written for anyone using the package.

[full sentences]: https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#comment-sentences

A documentation comment applies to the following symbol, or the group of fields
if it appears in a struct.

```go
// Good:
// Options configure the group management service.
type Options struct {
    // General setup:
    Name  string
    Group *FooGroup

    // Dependencies:
    DB *sql.DB

    // Customization:
    LargeGroupThreshold int // optional; default: 10
    MinimumMembers      int // optional; default: 2
}
```

**Best Practice:** If you have doc comments for unexported code, follow the same
custom as if it were exported (namely, starting the comment with the unexported
name). This makes it easy to export it later by simply replacing the unexported
name with the newly-exported one across both comments and code.

[Godoc]: https://pkg.go.dev/time#example-Duration

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#doc-comments. Locally segmented; local links rewritten to this pinned revision. -->
