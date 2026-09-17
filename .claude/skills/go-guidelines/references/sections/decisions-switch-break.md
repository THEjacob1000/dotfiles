<a id="language"></a>

## Language

<a id="switch-break"></a>

### `switch` and `break`

<a id="TOC-SwitchBreak"></a>

Do not use `break` statements without target labels at the ends of `switch`
clauses; they are redundant. Unlike in C and Java, `switch` clauses in Go
automatically break, and a `fallthrough` statement is needed to achieve the
C-style behavior. Use a comment rather than `break` if you want to clarify the
purpose of an empty clause.

```go
// Good:
switch x {
case "A", "B":
    buf.WriteString(x)
case "C":
    // handled outside of the switch statement
default:
    return fmt.Errorf("unknown value: %q", x)
}
```

```go
// Bad:
switch x {
case "A", "B":
    buf.WriteString(x)
    break // this break is redundant
case "C":
    break // this break is redundant
default:
    return fmt.Errorf("unknown value: %q", x)
}
```

> **Note:** If a `switch` clause is within a `for` loop, using `break` within
> `switch` does not exit the enclosing `for` loop.
>
> ```go
> for {
>   switch x {
>   case "A":
>      break // exits the switch, not the loop
>   }
> }
> ```
>
> To escape the enclosing loop, use a label on the `for` statement:
>
> ```go
> loop:
>   for {
>     switch x {
>     case "A":
>        break loop // exits the loop
>     }
>   }
> ```

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#switch-break. Locally segmented; local links rewritten to this pinned revision. -->
