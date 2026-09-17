<a id="language"></a>

## Language

<a id="type-aliases"></a>

### Type aliases

<a id="TOC-TypeAliases"></a>

Use a *type definition*, `type T1 T2`, to define a new type. Use a
[*type alias*], `type T1 = T2`, to refer to an existing type without defining a
new type. Type aliases are rare; their primary use is to aid migrating packages
to new source code locations. Don't use type aliasing when it is not needed.

[*type alias*]: http://golang.org/ref/spec#Type_declarations

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#type-aliases. Locally segmented; local links rewritten to this pinned revision. -->
