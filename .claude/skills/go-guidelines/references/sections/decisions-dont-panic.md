<a id="language"></a>

## Language

<a id="dont-panic"></a>

### Don't panic

<a id="TOC-Don-t-Panic"></a>

Do not use `panic` for normal error handling. Instead, use `error` and multiple
return values. See the [Effective Go section on errors].

Within `package main` and initialization code, consider [`log.Exit`] for errors
that should terminate the program (e.g., invalid configuration), as in many of
these cases a stack trace will not help the reader. Please note that
[`log.Exit`] calls [`os.Exit`] and any deferred functions will not be run.

For errors that indicate "impossible" conditions, namely bugs that should always
be caught during code review and/or testing, a function may reasonably return an
error or call [`log.Fatal`].

Also see [when panic is acceptable](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#when-to-panic).

**Note:** `log.Fatalf` is not the standard library log. See [#logging].

[Effective Go section on errors]: http://golang.org/doc/effective_go.html#errors
[`os.Exit`]: https://pkg.go.dev/os#Exit

[`log.Exit`]: https://pkg.go.dev/github.com/golang/glog#Exit
[`log.Fatal`]: https://pkg.go.dev/github.com/golang/glog#Fatal

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#dont-panic. Locally segmented; local links rewritten to this pinned revision. -->
