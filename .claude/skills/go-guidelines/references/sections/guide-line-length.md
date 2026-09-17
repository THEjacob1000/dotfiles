<a id="core"></a>

## Core guidelines

These guidelines collect the most important aspects of Go style that all Go code
is expected to follow. We expect that these principles be learned and followed
by the time readability is granted. These are not expected to change frequently,
and new additions will have to clear a high bar.

The guidelines below expand on the recommendations in [Effective Go], which
provide a common baseline for Go code across the entire community.

[Effective Go]: https://go.dev/doc/effective_go

<a id="line-length"></a>

### Line length

There is no fixed line length for Go source code. If a line feels too long,
prefer refactoring instead of splitting it. If it is already as short as it is
practical for it to be, the line should be allowed to remain long.

Do not split a line:

*   Before an [indentation change](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#indentation-confusion) (e.g.,
    function declaration, conditional)
*   To make a long string (e.g., a URL) fit into multiple shorter lines

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#line-length. Locally segmented; local links rewritten to this pinned revision. -->
