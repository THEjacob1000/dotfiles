<a id="language"></a>

## Language

<a id="literal-formatting"></a>

### Literal formatting

Go has an exceptionally powerful [composite literal syntax], with which it is
possible to express deeply-nested, complicated values in a single expression.
Where possible, this literal syntax should be used instead of building values
field-by-field. The `gofmt` formatting for literals is generally quite good, but
there are some additional rules for keeping these literals readable and
maintainable.

[composite literal syntax]: https://golang.org/ref/spec#Composite_literals

<a id="literal-repeated-type-names"></a>

#### Repeated type names

Repeated type names may be omitted from slice and map literals. This can be
helpful in reducing clutter. A reasonable occasion for repeating the type names
explicitly is when dealing with a complex type that is not common in your
project, when the repetitive type names are on lines that are far apart and can
remind the reader of the context.

```go
// Good:
good := []*Type{
    {A: 42},
    {A: 43},
}
```

```go
// Bad:
repetitive := []*Type{
    &Type{A: 42},
    &Type{A: 43},
}
```

```go
// Good:
good := map[Type1]*Type2{
    {A: 1}: {B: 2},
    {A: 3}: {B: 4},
}
```

```go
// Bad:
repetitive := map[Type1]*Type2{
    Type1{A: 1}: &Type2{B: 2},
    Type1{A: 3}: &Type2{B: 4},
}
```

**Tip:** If you want to remove repetitive type names in struct literals, you can
run `gofmt -s`.

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#literal-repeated-type-names. Locally segmented; local links rewritten to this pinned revision. -->
