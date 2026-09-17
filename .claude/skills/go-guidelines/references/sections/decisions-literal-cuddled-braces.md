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

<a id="literal-cuddled-braces"></a>

#### Cuddled braces

Dropping whitespace between braces (aka "cuddling" them) for slice and array
literals is only permitted when both of the following are true.

*   The [indentation matches](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#literal-matching-braces)
*   The inner values are also literals or proto builders (i.e. not a variable or
    other expression)

```go
// Good:
good := []*Type{
    { // Not cuddled
        Field: "value",
    },
    {
        Field: "value",
    },
}
```

```go
// Good:
good := []*Type{{ // Cuddled correctly
    Field: "value",
}, {
    Field: "value",
}}
```

```go
// Good:
good := []*Type{
    first, // Can't be cuddled
    {Field: "second"},
}
```

```go
// Good:
okay := []*pb.Type{pb.Type_builder{
    Field: "first", // Proto Builders may be cuddled to save vertical space
}.Build(), pb.Type_builder{
    Field: "second",
}.Build()}
```

```go
// Bad:
bad := []*Type{
    first,
    {
        Field: "second",
    }}
```

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#literal-cuddled-braces. Locally segmented; local links rewritten to this pinned revision. -->
