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

<a id="literal-matching-braces"></a>

#### Matching braces

The closing half of a brace pair should always appear on a line with the same
amount of indentation as the opening brace. One-line literals necessarily have
this property. When the literal spans multiple lines, maintaining this property
keeps the brace matching for literals the same as brace matching for common Go
syntactic constructs like functions and `if` statements.

The most common mistake in this area is putting the closing brace on the same
line as a value in a multi-line struct literal. In these cases, the line should
end with a comma and the closing brace should appear on the next line.

```go
// Good:
good := []*Type{{Key: "value"}}
```

```go
// Good:
good := []*Type{
    {Key: "multi"},
    {Key: "line"},
}
```

```go
// Bad:
bad := []*Type{
    {Key: "multi"},
    {Key: "line"}}
```

```go
// Bad:
bad := []*Type{
    {
        Key: "value"},
}
```

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#literal-matching-braces. Locally segmented; local links rewritten to this pinned revision. -->
