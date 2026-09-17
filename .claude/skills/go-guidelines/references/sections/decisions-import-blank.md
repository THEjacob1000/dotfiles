<a id="imports"></a>

## Imports

<a id="TOC-Imports"></a>

<a id="import-blank"></a>

### Import "blank" (`import _`)

<a id="TOC-ImportBlank"></a>

Packages that are imported only for their side effects (using the syntax `import
_ "package"`) may only be imported in a main package, or in tests that require
them.

Some examples of such packages include:

*   [time/tzdata](https://pkg.go.dev/time/tzdata)

*   [image/jpeg](https://pkg.go.dev/image/jpeg) in image processing code

Avoid blank imports in library packages, even if the library indirectly depends
on them. Constraining side-effect imports to the main package helps control
dependencies, and makes it possible to write tests that rely on a different
import without conflict or wasted build costs.

The following are the only exceptions to this rule:

*   You may use a blank import to bypass the check for disallowed imports in the
    [nogo static checker].

*   You may use a blank import of the [embed](https://pkg.go.dev/embed) package
    in a source file which uses the `//go:embed` compiler directive.

**Tip:** If you create a library package that indirectly depends on a
side-effect import in production, document the intended usage.

[nogo static checker]: https://github.com/bazelbuild/rules_go/blob/master/go/nogo.rst

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#import-blank. Locally segmented; local links rewritten to this pinned revision. -->
