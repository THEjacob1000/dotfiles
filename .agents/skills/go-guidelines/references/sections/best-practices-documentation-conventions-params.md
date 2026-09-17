<a id="documentation"></a>

## Documentation

<a id="documentation-conventions"></a>

### Conventions

This section augments the decisions document's [commentary] section.

Go code that is documented in familiar style is easier to read and less likely
to be misused than something misdocumented or not documented at all. Runnable
[examples] show up in Godoc and Code Search and are an excellent way of
explaining how to use your code.

[examples]: https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#examples

<a id="documentation-conventions-params"></a>

#### Parameters and configuration

Not every parameter must be enumerated in the documentation. This applies to:

*   function and method parameters
*   struct fields
*   APIs for options

Document the error-prone or non-obvious fields and parameters by saying why they
are interesting.

In the following snippet, the highlighted commentary adds little useful
information to the reader:

```go
// Bad:
// Sprintf formats according to a format specifier and returns the resulting
// string.
//
// format is the format, and data is the interpolation data.
func Sprintf(format string, data ...any) string
```

However, this snippet demonstrates a code scenario similar to the previous where
the commentary instead states something non-obvious or materially helpful to the
reader:

```go
// Good:
// Sprintf formats according to a format specifier and returns the resulting
// string.
//
// The provided data is used to interpolate the format string. If the data does
// not match the expected format verbs or the amount of data does not satisfy
// the format specification, the function will inline warnings about formatting
// errors into the output string as described by the Format errors section
// above.
func Sprintf(format string, data ...any) string
```

Consider your likely audience in choosing what to document and at what depth.
Maintainers, newcomers to the team, external users, and even yourself six months
in the future may appreciate slightly different information from what is on your
mind when you first come to write your docs.

See also:

*   [GoTip #41: Identify Function Call Parameters]
*   [GoTip #51: Patterns for Configuration]

[commentary]: https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#commentary
[GoTip #41: Identify Function Call Parameters]: https://google.github.io/styleguide/go/index.html#gotip
[GoTip #51: Patterns for Configuration]: https://google.github.io/styleguide/go/index.html#gotip

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#documentation-conventions-params. Locally segmented; local links rewritten to this pinned revision. -->
