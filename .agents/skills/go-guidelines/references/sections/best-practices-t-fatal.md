<a id="tests"></a>

## Tests

<a id="t-fatal"></a>

### `t.Error` vs. `t.Fatal`

As discussed in [decisions](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#keep-going), tests should generally not
abort at the first encountered problem.

However, some situations require that the test not proceed. Calling `t.Fatal` is
appropriate when some piece of test setup fails, especially in
[test setup helpers], without which you cannot run the rest of the test. In a
table-driven test, `t.Fatal` is appropriate for failures that set up the whole
test function before the test loop. Failures that affect a single entry in the
test table, which make it impossible to continue with that entry, should be
reported as follows:

*   If you're not using `t.Run` subtests, use `t.Error` followed by a `continue`
    statement to move on to the next table entry.
*   If you're using subtests (and you're inside a call to `t.Run`), use
    `t.Fatal`, which ends the current subtest and allows your test case to
    progress to the next subtest.

**Warning:** It is not always safe to call `t.Fatal` and similar functions.
[More details here](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#t-fatal-goroutine).

[test setup helpers]: https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#test-helper-error-handling

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#t-fatal. Locally segmented; local links rewritten to this pinned revision. -->
