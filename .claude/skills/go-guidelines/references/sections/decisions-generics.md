<a id="language"></a>

## Language

<a id="generics"></a>

### Generics

Generics (formally called "[Type Parameters]") are allowed where they fulfill
your business requirements. In many applications, a conventional approach using
existing language features (slices, maps, interfaces, and so on) works just as
well without the added complexity, so be wary of premature use. See the
discussion on [least mechanism](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#least-mechanism).

When introducing an exported API that uses generics, make sure it is suitably
documented. It's highly encouraged to include motivating runnable [examples].

Do not use generics just because you are implementing an algorithm or data
structure that does not care about the type of its member elements. If there is
only one type being instantiated in practice, start by making your code work on
that type without using generics at all. Adding polymorphism later will be
straightforward compared to removing abstraction that is found to be
unnecessary.

Do not use generics to invent domain-specific languages (DSLs). In particular,
refrain from introducing error-handling frameworks that might put a significant
burden on readers. Instead prefer established [error handling](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#errors)
practices. For testing, be especially wary of introducing
[assertion libraries](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#assert) or frameworks that result in less useful
[test failures](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#useful-test-failures).

In general:

*   [Write code, don't design types]. From a GopherCon talk by Robert Griesemer
    and Ian Lance Taylor.
*   If you have several types that share a useful unifying interface, consider
    modeling the solution using that interface. Generics may not be needed.
*   Otherwise, instead of relying on the `any` type and excessive
    [type switching](https://tour.golang.org/methods/16), consider generics.

See also:

*   [Using Generics in Go], talk by Ian Lance Taylor

*   [Generics tutorial] on Go's webpage

[Generics tutorial]: https://go.dev/doc/tutorial/generics
[Type Parameters]: https://go.dev/design/43651-type-parameters
[Using Generics in Go]: https://www.youtube.com/watch?v=nr8EpUO9jhw
[Write code, don't design types]: https://www.youtube.com/watch?v=Pa_e9EeCdy8&t=1250s

[examples]: https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#examples

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#generics. Locally segmented; local links rewritten to this pinned revision. -->
