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

<a id="package-comments"></a>

### Package comments

<a id="TOC-PackageComments"></a>

Package comments must appear immediately above the package clause with no blank
line between the comment and the package name. Example:

```go
// Good:
// Package math provides basic constants and mathematical functions.
//
// This package does not guarantee bit-identical results across architectures.
package math
```

There must be a single package comment per package. If a package is composed of
multiple files, exactly one of the files should have a package comment.

Comments for `main` packages have a slightly different form, where the name of
the `go_binary` rule in the BUILD file takes the place of the package name.

```go
// Good:
// The seed_generator command is a utility that generates a Finch seed file
// from a set of JSON study configs.
package main
```

Other styles of comment are fine as long as the name of the binary is exactly as
written in the BUILD file. When the binary name is the first word, capitalizing
it is required even though it does not strictly match the spelling of the
command-line invocation.

```go
// Good:
// Binary seed_generator ...
// Command seed_generator ...
// Program seed_generator ...
// The seed_generator command ...
// The seed_generator program ...
// Seed_generator ...
```

Tips:

*   Example command-line invocations and API usage can be useful documentation.
    For Godoc formatting, indent the comment lines containing code.

*   If there is no obvious primary file or if the package comment is
    extraordinarily long, it is acceptable to put the doc comment in a file
    named `doc.go` with only the comment and the package clause.

*   Multiline comments can be used instead of multiple single-line comments.
    This is primarily useful if the documentation contains sections which may be
    useful to copy and paste from the source file, as with sample command-lines
    (for binaries) and template examples.

    ```go
    // Good:
    /*
    The seed_generator command is a utility that generates a Finch seed file
    from a set of JSON study configs.

        seed_generator *.json | base64 > finch-seed.base64
    */
    package template
    ```

*   Comments intended for maintainers and that apply to the whole file are
    typically placed after import declarations. These are not surfaced in Godoc
    and are not subject to the rules above on package comments.

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#package-comments. Locally segmented; local links rewritten to this pinned revision. -->
