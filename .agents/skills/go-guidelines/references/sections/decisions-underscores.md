<a id="naming"></a>

## Naming

See the naming section within [the core style guide](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#naming) for
overarching guidance on naming. The following sections provide further
clarification on specific areas within naming.

<a id="underscores"></a>

### Underscores

Names in Go should in general not contain underscores. There are three
exceptions to this principle:

1.  Package names that are only imported by generated code may contain
    underscores. See [package names](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#package-names) for more detail around how
    to choose multi-word package names.
1.  Test, Benchmark and Example function names within `*_test.go` files may
    include underscores.
1.  Low-level libraries that interoperate with the operating system or cgo may
    reuse identifiers, as is done in [`syscall`]. This is expected to be very
    rare in most codebases.

**Note:** Filenames of source code are not Go identifiers and do not have to
follow these conventions. They may contain underscores.

[`syscall`]: https://pkg.go.dev/syscall#pkg-constants

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#underscores. Locally segmented; local links rewritten to this pinned revision. -->
