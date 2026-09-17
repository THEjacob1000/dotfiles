<a id="naming"></a>

## Naming

See the naming section within [the core style guide](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#naming) for
overarching guidance on naming. The following sections provide further
clarification on specific areas within naming.

<a id="repetition"></a>

### Repetition

<!--
Note to future editors:

Do not use the term "stutter" to refer to cases when a name is repetitive.
-->

A piece of Go source code should avoid unnecessary repetition. One common source
of this is repetitive names, which often include unnecessary words or repeat
their context or type. Code itself can also be unnecessarily repetitive if the
same or a similar code segment appears multiple times in close proximity.

Repetitive naming can come in many forms, including:

<a id="repetitive-with-type"></a>

#### Variable name vs. type

The compiler always knows the type of a variable, and in most cases it is also
clear to the reader what type a variable is by how it is used. It is only
necessary to clarify the type of a variable if its value appears twice in the
same scope.

Repetitive Name               | Better Name
----------------------------- | ----------------------
`var numUsers int`            | `var users int`
`var nameString string`       | `var name string`
`var primaryProject *Project` | `var primary *Project`

If the value appears in multiple forms, this can be clarified either with an
extra word like `raw` and `parsed` or with the underlying representation:

```go
// Good:
limitRaw := r.FormValue("limit")
limit, err := strconv.Atoi(limitRaw)
```

```go
// Good:
limitStr := r.FormValue("limit")
limit, err := strconv.Atoi(limitStr)
```

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#repetitive-with-type. Locally segmented; local links rewritten to this pinned revision. -->
