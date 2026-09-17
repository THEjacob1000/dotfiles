<a id="naming"></a>

## Naming

<a id="util-packages"></a>

### Util packages

Go packages have a name specified on the `package` declaration, separate from
the import path. The package name matters more for readability than the path.

Go package names should be
[related to what the package provides](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#package-names). Naming a
package just `util`, `helper`, `common` or similar is usually a poor choice (it
can be used as *part* of the name though). Uninformative names make the code
harder to read, and if used too broadly they are liable to cause needless
[import conflicts](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#import-renaming).

Instead, consider what the callsite will look like.

```go
// Good:
db := spannertest.NewDatabaseFromFile(...)

_, err := f.Seek(0, io.SeekStart)

b := elliptic.Marshal(curve, x, y)
```

You can tell roughly what each of these do even without knowing the imports list
(`cloud.google.com/go/spanner/spannertest`, `io`, and `crypto/elliptic`). With
less focused names, these might read:

```go
// Bad:
db := test.NewDatabaseFromFile(...)

_, err := f.Seek(0, common.SeekStart)

b := helper.Marshal(curve, x, y)
```

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#util-packages. Locally segmented; local links rewritten to this pinned revision. -->
