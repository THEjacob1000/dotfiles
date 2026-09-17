<a id="interfaces"></a>

## Interfaces

Interfaces in Go are powerful but can be overused or misunderstood. Because Go
interfaces are satisfied implicitly, they are a structural tool rather than a
declarative one. The following guidance provides the best practices for how to
design and return interfaces in Go without over-engineering your codebase.

Refer to [Decisions' section on interfaces](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#interfaces) for a summary.

<a id="avoid-unnecessary-interfaces"></a>

### Avoid unnecessary interfaces

The most common mistake is creating an interface before a
[real need](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#simplicity) exists.

1.  **Don’t confuse the concept with the keyword:** Just because you are
    designing a "service" or a "repository" or similar pattern doesn't mean you
    need a named interface type (e.g., `type Service interface`). Focus on the
    behavior and its concrete implementation first.

2.  **Reuse existing interfaces:** If an interface already exists, especially in
    generated code, like a RPC client or server, use it ([testing RPC]). Do not
    wrap a generated RPC code in a new, manual interface just for the sake of
    abstraction or testing. [Use real transports](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#use-real-transports) instead.

3.  **Don't define back doors only for tests:** Do not export a [test double]
    implementation of an interface from an API that consumes it. Instead, prefer
    to design the API so that it can be tested using the [public API] of the
    real implementation.

    Every exported type increases the cognitive load for the reader. When you
    export a test double alongside the real implementation, you force the reader
    to understand three entities (the interface, the real implementation, and
    the test double) instead of one.

    Export an interface for a test double when you have a
    [material need](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#least-mechanism) to support substitution.

When it does make sense to create an interface:

1.  **Multiple implementations:** When there are two or more concrete types that
    must be handled by the same logic (e.g., something that operates with both
    [json.Encoder](https://pkg.go.dev/encoding/json#Encoder) and
    [gob.GobEncoder](https://pkg.go.dev/encoding/gob#GobEncoder)), the API
    consumer could define an interface.

2.  **Decoupling packages:** To break circular dependencies between two packages
    (see an [example](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#avoiding-circular-dependencies)), an API producer could
    define an interface.

    **Caution:** Carefully observe guidance on [Package Size](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#package-size).
    Introducing interfaces to break dependency cycles is often a signal of
    improperly structured packages.

3.  **Hiding complexity:** When a concrete type has a massive API surface, but a
    specific function only needs one or two methods, an API consumer may define
    an interface.

[public API]: https://abseil.io/resources/swe-book/html/ch12.html#test_via_public_apis
[test double]: https://abseil.io/resources/swe-book/html/ch13.html
[testing RPC]: https://codelabs.developers.google.com/grpc/getting-started-grpc-go#3

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#avoid-unnecessary-interfaces. Locally segmented; local links rewritten to this pinned revision. -->
