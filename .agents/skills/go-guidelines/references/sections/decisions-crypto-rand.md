## Common libraries

<a id="crypto-rand"></a>

### crypto/rand

<a id="TOC-CryptoRand"></a>

Do not use package `math/rand` to generate keys, even throwaway ones. If
unseeded, the generator is completely predictable. Seeded with
`time.Nanoseconds()`, there are just a few bits of entropy. Instead, use
`crypto/rand`'s Reader, and if you need text, print to hexadecimal or base64.

```go
// Good:
import (
    "crypto/rand"
    // "encoding/base64"
    // "encoding/hex"
    "fmt"

    // ...
)

func Key() string {
    buf := make([]byte, 16)
    if _, err := rand.Read(buf); err != nil {
        log.Fatalf("Out of randomness, should never happen: %v", err)
    }
    return fmt.Sprintf("%x", buf)
    // or hex.EncodeToString(buf)
    // or base64.StdEncoding.EncodeToString(buf)
}
```

**Note:** `log.Fatalf` is not the standard library log. See [#logging].

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#crypto-rand. Locally segmented; local links rewritten to this pinned revision. -->
