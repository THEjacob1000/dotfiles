<a id="useful-test-failures"></a>

## Useful test failures

<a id="TOC-UsefulTestFailures"></a>

It should be possible to diagnose a test's failure without reading the test's
source. Tests should fail with helpful messages detailing:

*   What caused the failure
*   What inputs resulted in an error
*   The actual result
*   What was expected

Specific conventions for achieving this goal are outlined below.

<a id="compare-stable-results"></a>

### Compare stable results

Avoid comparing results that may depend on output stability of a package that
you do not own. Instead, the test should compare on semantically relevant
information that is stable and resistant to changes in dependencies. For
functionality that returns a formatted string or serialized bytes, it is
generally not safe to assume that the output is stable.

For example, [`json.Marshal`] can change (and has changed in the past) the
specific bytes that it emits. Tests that perform string equality on the JSON
string may break if the `json` package changes how it serializes the bytes.
Instead, a more robust test would parse the contents of the JSON string and
ensure that it is semantically equivalent to some expected data structure.

[`json.Marshal`]: https://golang.org/pkg/encoding/json/#Marshal

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#compare-stable-results. Locally segmented; local links rewritten to this pinned revision. -->
