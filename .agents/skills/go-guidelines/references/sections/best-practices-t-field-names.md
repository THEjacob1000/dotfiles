<a id="tests"></a>

## Tests

<a id="t-field-names"></a>

### Use field names in struct literals

<a id="t-field-labels"></a>

In table-driven tests, prefer to specify field names when initializing test case
struct literals. This is helpful when the test cases cover a large amount of
vertical space (e.g. more than 20-30 lines), when there are adjacent fields with
the same type, and also when you wish to omit fields which have the zero value.
For example:

```go
// Good:
func TestStrJoin(t *testing.T) {
    tests := []struct {
        slice     []string
        separator string
        skipEmpty bool
        want      string
    }{
        {
            slice:     []string{"a", "b", ""},
            separator: ",",
            want:      "a,b,",
        },
        {
            slice:     []string{"a", "b", ""},
            separator: ",",
            skipEmpty: true,
            want:      "a,b",
        },
        // ...
    }
    // ...
}
```

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#t-field-names. Locally segmented; local links rewritten to this pinned revision. -->
