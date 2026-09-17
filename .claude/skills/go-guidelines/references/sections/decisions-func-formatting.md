<a id="language"></a>

## Language

<a id="func-formatting"></a>

### Function formatting

The signature of a function or method declaration should remain on a single line
to avoid [indentation confusion](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#indentation-confusion).

Function argument lists can make some of the longest lines in a Go source file.
However, they precede a change in indentation, and therefore it is difficult to
break the line in a way that does not make subsequent lines look like part of
the function body in a confusing way:

```go
// Bad:
func (r *SomeType) SomeLongFunctionName(foo1, foo2, foo3 string,
    foo4, foo5, foo6 int) {
    foo7 := bar(foo1)
    // ...
}
```

See [best practices](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#funcargs) for a few options for shortening
the call sites of functions that would otherwise have many arguments.

Lines can often be shortened by factoring out local variables.

```go
// Good:
local := helper(some, parameters, here)
good := foo.Call(list, of, parameters, local)
```

Similarly, function and method calls should not be separated based solely on
line length.

```go
// Good:
good := foo.Call(long, list, of, parameters, all, on, one, line)
```

```go
// Bad:
bad := foo.Call(long, list, of, parameters,
    with, arbitrary, line, breaks)
```

Avoid adding inline comments to specific function arguments where possible.
Instead, use an [option struct](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#option-structure) or add more
detail to the function documentation.

```go
// Good:
good := server.New(ctx, server.Options{Port: 42})
```

```go
// Bad:
bad := server.New(
    ctx,
    42, // Port
)
```

If the API cannot be changed or if the local call is unusual (whether or not the
call is too long), it is always permissible to add line breaks if it aids in
understanding the call.

```go
// Good:
canvas.RenderHeptagon(fillColor,
    x0, y0, vertexColor0,
    x1, y1, vertexColor1,
    x2, y2, vertexColor2,
    x3, y3, vertexColor3,
    x4, y4, vertexColor4,
    x5, y5, vertexColor5,
    x6, y6, vertexColor6,
)
```

Note that the lines in the above example are not wrapped at a specific column
boundary but are grouped based on vertex coordinates and color.

Long string literals within functions should not be broken for the sake of line
length. For functions that include such strings, a line break can be added after
the string format, and the arguments can be provided on the next or subsequent
lines. The decision about where the line breaks should go is best made based on
semantic groupings of inputs, rather than based purely on line length.

```go
// Good:
log.Warningf("Database key (%q, %d, %q) incompatible in transaction started by (%q, %d, %q)",
    currentCustomer, currentOffset, currentKey,
    txCustomer, txOffset, txKey)
```

```go
// Bad:
log.Warningf("Database key (%q, %d, %q) incompatible in"+
    " transaction started by (%q, %d, %q)",
    currentCustomer, currentOffset, currentKey, txCustomer,
    txOffset, txKey)
```

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#func-formatting. Locally segmented; local links rewritten to this pinned revision. -->
