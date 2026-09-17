<a id="core"></a>

## Core guidelines

These guidelines collect the most important aspects of Go style that all Go code
is expected to follow. We expect that these principles be learned and followed
by the time readability is granted. These are not expected to change frequently,
and new additions will have to clear a high bar.

The guidelines below expand on the recommendations in [Effective Go], which
provide a common baseline for Go code across the entire community.

[Effective Go]: https://go.dev/doc/effective_go

<a id="formatting"></a>

### Formatting

All Go source files must conform to the format outputted by the `gofmt` tool.
This format is enforced by a presubmit check in the Google codebase.
[Generated code] should generally also be formatted (e.g., by using
[`format.Source`]), as it is also browsable in Code Search.

[Generated code]: https://docs.bazel.build/versions/main/be/general.html#genrule
[`format.Source`]: https://pkg.go.dev/go/format#Source

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#formatting. Locally segmented; local links rewritten to this pinned revision. -->
