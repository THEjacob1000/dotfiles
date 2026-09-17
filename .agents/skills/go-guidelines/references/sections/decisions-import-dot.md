<a id="imports"></a>

## Imports

<a id="TOC-Imports"></a>

<a id="import-dot"></a>

### Import "dot" (`import .`)

<a id="TOC-ImportDot"></a>

The `import .` form is a language feature that allows bringing identifiers
exported from another package to the current package without qualification. See
the [language spec](https://go.dev/ref/spec#Import_declarations) for more.

Do **not** use this feature in the Google codebase; it makes it harder to tell
where the functionality is coming from.

```go
// Bad:
package foo_test

import (
    "bar/testutil" // also imports "foo"
    . "foo"
)

var myThing = Bar() // Bar defined in package foo; no qualification needed.
```

```go
// Good:
package foo_test

import (
    "bar/testutil" // also imports "foo"
    "foo"
)

var myThing = foo.Bar()
```

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#import-dot. Locally segmented; local links rewritten to this pinned revision. -->
