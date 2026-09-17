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

<a id="level-of-detail"></a>

### Level of detail

The conventional failure message, which is suitable for most Go tests, is
`YourFunc(%v) = %v, want %v`. However, there are cases that may call for more or
less detail:

*   Tests performing complex interactions should describe the interactions too.
    For example, if the same `YourFunc` is called several times, identify which
    call failed the test. If it's important to know any extra state of the
    system, include that in the failure output (or at least in the logs).
*   If the data is a complex struct with significant boilerplate, it is
    acceptable to describe only the important parts in the message, but do not
    overly obscure the data.
*   Setup failures do not require the same level of detail. If a test helper
    populates a Spanner table but Spanner was down, you probably don't need to
    include which test input you were going to store in the database.
    `t.Fatalf("Setup: Failed to set up test database: %s", err)` is usually
    helpful enough to resolve the issue.

**Tip:** Make your failure mode trigger during development. Review what the
failure message looks like and whether a maintainer can effectively deal with
the failure.

There are some techniques for reproducing test inputs and outputs clearly:

*   When printing string data, [`%q` is often useful](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#use-percent-q) to
    emphasize that the value is important and to more easily spot bad values.
*   When printing (small) structs, `%+v` can be more useful than `%v`.
*   When validation of larger values fails, [printing a diff](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#print-diffs) can
    make it easier to understand the failure.

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#level-of-detail. Locally segmented; local links rewritten to this pinned revision. -->
