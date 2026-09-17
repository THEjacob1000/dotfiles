<a id="test-structure"></a>

## Test structure

<a id="test-package"></a>

### Test package

<a id="TOC-TestPackage"></a>

<a id="test-different-package"></a>

#### Tests in a different package

It is not always appropriate or even possible to define a test in the same
package as the code being tested. In these cases, use a package name with the
`_test` suffix. This is an exception to the "no underscores" rule to
[package names](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#package-names). For example:

*   If an integration test does not have an obvious library that it belongs to

    ```go
    // Good:
    package gmailintegration_test

    import "testing"
    ```

*   If defining the tests in the same package results in circular dependencies

    ```go
    // Good:
    package fireworks_test

    import (
      "fireworks"
      "fireworkstestutil" // fireworkstestutil also imports fireworks
    )
    ```

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#test-different-package. Locally segmented; local links rewritten to this pinned revision. -->
