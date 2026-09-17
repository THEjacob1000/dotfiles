<a id="test-structure"></a>

## Test structure

<a id="test-package"></a>

### Test package

<a id="TOC-TestPackage"></a>

<a id="test-same-package"></a>

#### Tests in the same package

Tests may be defined in the same package as the code being tested.

To write a test in the same package:

*   Place the tests in a `foo_test.go` file
*   Use `package foo` for the test file
*   Do not explicitly import the package to be tested

```build
# Good:
go_library(
    name = "foo",
    srcs = ["foo.go"],
    deps = [
        ...
    ],
)

go_test(
    name = "foo_test",
    size = "small",
    srcs = ["foo_test.go"],
    library = ":foo",
    deps = [
        ...
    ],
)
```

A test in the same package can access unexported identifiers in the package.
This may enable better test coverage and more concise tests. Be aware that any
[examples] declared in the test will not have the package names that a user will
need in their code.

[`library`]: https://github.com/bazelbuild/rules_go/blob/master/docs/go/core/rules.md#go_library
[examples]: https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#examples

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#test-same-package. Locally segmented; local links rewritten to this pinned revision. -->
