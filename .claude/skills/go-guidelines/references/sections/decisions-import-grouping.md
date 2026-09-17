<a id="imports"></a>

## Imports

<a id="TOC-Imports"></a>

<a id="import-grouping"></a>

### Import grouping

Imports should be organized into the following groups, in order:

1.  Standard library packages

1.  Other (project and vendored) packages

1.  Protocol Buffer imports (e.g., `fpb "path/to/foo_go_proto"`)

1.  Import for [side-effects](https://go.dev/doc/effective_go#blank_import)
    (e.g., `_ "path/to/package"`)

```go
// Good:
package main

import (
    "fmt"
    "hash/adler32"
    "os"

    "github.com/dsnet/compress/flate"
    "golang.org/x/text/encoding"
    "google.golang.org/protobuf/proto"

    foopb "myproj/foo/proto/proto"

    _ "myproj/rpc/protocols/dial"
    _ "myproj/security/auth/authhooks"
)
```

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#import-grouping. Locally segmented; local links rewritten to this pinned revision. -->
