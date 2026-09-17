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

<a id="print-diffs"></a>

### Print diffs

If your function returns large output then it can be hard for someone reading
the failure message to find the differences when your test fails. Instead of
printing both the returned value and the wanted value, make a diff.

To compute diffs for such values, `cmp.Diff` is preferred, particularly for new
tests and new code, but other tools may be used. See [types of equality] for
guidance regarding the strengths and weaknesses of each function.

*   [`cmp.Diff`]

*   [`pretty.Compare`]

You can use the [`diff`] package to compare multi-line strings or lists of
strings. You can use this as a building block for other kinds of diffs.

[types of equality]: https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#types-of-equality
[`diff`]: https://pkg.go.dev/github.com/kylelemons/godebug/diff
[`pretty.Compare`]: https://pkg.go.dev/github.com/kylelemons/godebug/pretty#Compare

Add some text to your failure message explaining the direction of the diff.

<!--
The reversed order of want and got in these examples is intentional, as this is
the prevailing order across the Google codebase. The lack of a stance on which
order to use is also intentional, as there is no consensus which is
"most readable."


-->

*   Something like `diff (-want +got)` is good when you're using the `cmp`,
    `pretty`, and `diff` packages (if you pass `(want, got)` to the function),
    because the `-` and `+` that you add to your format string will match the
    `-` and `+` that actually appear at the beginning of the diff lines. If you
    pass `(got, want)` to your function, the correct key would be `(-got +want)`
    instead.

*   The `messagediff` package uses a different output format, so the message
    `diff (want -> got)` is appropriate when you're using it (if you pass
    `(want, got)` to the function), because the direction of the arrow will
    match the direction of the arrow in the "modified" lines.

The diff will span multiple lines, so you should print a newline before you
print the diff.

[`cmp.Diff`]: https://pkg.go.dev/github.com/google/go-cmp/cmp#Diff

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#print-diffs. Locally segmented; local links rewritten to this pinned revision. -->
