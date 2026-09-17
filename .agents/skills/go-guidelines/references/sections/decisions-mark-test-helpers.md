<a id="test-structure"></a>

## Test structure

<a id="mark-test-helpers"></a>

### Test helpers

A test helper is a function that performs a setup or cleanup task. All failures
that occur in test helpers are expected to be failures of the environment (not
from the code under test) — for example when a test database cannot be started
because there are no more free ports on this machine.

If you pass a `*testing.T`, call [`t.Helper`] to attribute failures in the test
helper to the line where the helper is called. This parameter should come after
a [context](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#contexts) parameter, if present, and before any remaining
parameters.

```go
// Good:
func TestSomeFunction(t *testing.T) {
    golden := readFile(t, "testdata/golden-result.txt")
    // ... tests against golden ...
}

// readFile returns the contents of a data file.
// It must only be called from the same goroutine as started the test.
func readFile(t *testing.T, filename string) string {
    t.Helper()
    contents, err := runfiles.ReadFile(filename)
    if err != nil {
        t.Fatal(err)
    }
    return string(contents)
}
```

Do not use this pattern when it obscures the connection between a test failure
and the conditions that led to it. Specifically, the guidance about
[assert libraries](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#assert) still applies, and [`t.Helper`] should not be used
to implement such libraries.

**Tip:** For more on the distinction between test helpers and assertion helpers,
see [best practices](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#test-functions).

Although the above refers to `*testing.T`, much of the advice stays the same for
benchmark and fuzz helpers.

[`t.Helper`]: https://pkg.go.dev/testing#T.Helper

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#mark-test-helpers. Locally segmented; local links rewritten to this pinned revision. -->
