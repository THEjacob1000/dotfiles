<a id="interfaces"></a>

## Interfaces

Interfaces in Go are powerful but can be overused or misunderstood. Because Go
interfaces are satisfied implicitly, they are a structural tool rather than a
declarative one. The following guidance provides the best practices for how to
design and return interfaces in Go without over-engineering your codebase.

Refer to [Decisions' section on interfaces](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#interfaces) for a summary.

<a id="interface-ownership-and-visibility"></a>

### Interface ownership and visibility

1.  **Do not export interface types unnecessarily:** If an interface is only
    used internally within a package to satisfy a specific logic flow, keep the
    interface unexported. Exporting an interface commits you to maintaining that
    API for external callers.

2.  **The consumer defines the interface:** In Go, interfaces generally belong
    in the package that uses them, not the package that implements them. The
    consumer should define only the methods they actually use
    [GoTip #78: Minimal Viable Interfaces], adhering to the idea that
    [the bigger the interface, the weaker the abstraction](https://go-proverbs.github.io/).

    There are common scenarios where it often makes sense for the producer (the
    package providing the logic) to export the interface:

    *   **The interface is the product:** When a package’s primary purpose is to
        provide a common protocol that many different implementations must
        follow, the producer defines the interface. For example,
        [io.Writer](https://pkg.go.dev/io#Writer),
        [hash.Hash](https://pkg.go.dev/hash#Hash). The concept of "protocol"
        includes aspects like [documentation](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#documentation) about critical
        behaviors (e.g., expected use case, edge cases, concurrency) that need
        to be centrally and canonically explicated. Another prominent example of
        this is generated interfaces from protobuf. It doesn't abstract a
        specific behavior, it defines a boundary. Its purpose is to ensure that
        your server implementation exactly matches the schema defined in the
        `.proto` file. Here, the interface serves as a rigid legal contract
        between the service and its clients.

        For large systems, if the interface lives inside a huge implementation
        package, every client is forced to import the entire world just to
        reference the interface. You may define the interface in a standalone,
        implementation-free package, avoiding unnecessary symbols and potential
        circular dependencies. This is also the same philosophy used by
        generated code from protobuf.

    *   **Prevent interface bloat:** In large codebases, maintenance becomes
        difficult if numerous packages utilize the same `AuthService` while each
        defining an identical `type Authorizer interface`. While Go often favors
        [a little copying over a little dependency](https://go-proverbs.github.io/),
        keep in mind that maintaining perfectly mirrored interfaces (see point
        above) across many packages can create an unnecessary burden.

    *   **Resolve circular dependency:** see
        [an example](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#avoiding-circular-dependencies) below.

[GoTip #78: Minimal Viable Interfaces]: https://google.github.io/styleguide/go/index.html#gotip

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#interface-ownership-and-visibility. Locally segmented; local links rewritten to this pinned revision. -->
