<a id="language"></a>

## Language

<a id="use-any"></a>

### Use any

Go 1.18 introduces an `any` type as an [alias] to `interface{}`. Because it is
an alias, `any` is equivalent to `interface{}` in many situations and in others
it is easily interchangeable via an explicit conversion. Prefer to use `any` in
new code.

[alias]: https://go.googlesource.com/proposal/+/master/design/18130-type-alias.md

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#use-any. Locally segmented; local links rewritten to this pinned revision. -->
