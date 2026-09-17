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

<a id="got-before-want"></a>

### Got before want

Test outputs should include the actual value that the function returned before
printing the value that was expected. A standard format for printing test
outputs is `YourFunc(%v) = %v, want %v`. Where you would write "actual" and
"expected", prefer using the words "got" and "want", respectively.

For diffs, directionality is less apparent, and as such it is important to
include a key to aid in interpreting the failure. See the
[section on printing diffs]. Whichever diff order you use in your failure
messages, you should explicitly indicate it as a part of the failure message,
because existing code is inconsistent about the ordering.

[section on printing diffs]: https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#print-diffs

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#got-before-want. Locally segmented; local links rewritten to this pinned revision. -->
