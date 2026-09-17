<a id="vardecls"></a>

## Variable declarations

<a id="vardeclsize"></a>

### Size hints

The following are declarations that take advantage of size hints in order to
preallocate capacity:

```go
// Good:
var (
    // Preferred buffer size for target filesystem: st_blksize.
    buf = make([]byte, 131072)
    // Typically process up to 8-10 elements per run (16 is a safe assumption).
    q = make([]Node, 0, 16)
    // Each shard processes shardSize (typically 32000+) elements.
    seen = make(map[string]bool, shardSize)
)
```

Size hints and preallocation are important steps **when combined with empirical
analysis of the code and its integrations**, to create performance-sensitive and
resource-efficient code.

Most code does not need a size hint or preallocation, and can allow the runtime
to grow the slice or map as necessary. It is acceptable to preallocate when the
final size is known (e.g. when converting between a map and a slice) but this is
not a readability requirement, and may not be worth the clutter in small cases.

**Warning:** Preallocating more memory than you need can waste memory in the
fleet or even harm performance. When in doubt, see
[GoTip #3: Benchmarking Go Code] and default to a
[zero initialization](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#vardeclzero) or a
[composite literal declaration](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#vardeclcomposite).

[GoTip #3: Benchmarking Go Code]: https://google.github.io/styleguide/go/index.html#gotip

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#vardeclsize. Locally segmented; local links rewritten to this pinned revision. -->
