<a id="globals"></a>

## Global state

Libraries should not force their clients to use APIs that rely on
[global state](https://en.wikipedia.org/wiki/Global_variable). They are advised
not to expose APIs or export
[package level](https://go.dev/ref/spec#TopLevelDecl) variables that control
behavior for all clients as parts of their API. The rest of the section uses
"global" and "package level state" synonymously.

Instead, if your functionality maintains state, allow your clients to create and
use instance values.

**Important:** While this guidance is applicable to all developers, it is most
critical for infrastructure providers who offer libraries, integrations, and
services to other teams.

```go
// Good:
// Package sidecar manages subprocesses that provide features for applications.
package sidecar

type Registry struct { plugins map[string]*Plugin }

func New() *Registry { return &Registry{plugins: make(map[string]*Plugin)} }

func (r *Registry) Register(name string, p *Plugin) error { ... }
```

Your users will instantiate the data they need (a `*sidecar.Registry`) and then
pass it as an explicit dependency:

```go
// Good:
package main

func main() {
  sidecars := sidecar.New()
  if err := sidecars.Register("Cloud Logger", cloudlogger.New()); err != nil {
    log.Exitf("Could not setup cloud logger: %v", err)
  }
  cfg := &myapp.Config{Sidecars: sidecars}
  myapp.Run(context.Background(), cfg)
}
```

There are different approaches to migrating existing code to support dependency
passing. The main one you will use is passing dependencies as parameters to
constructors, functions, methods, or struct fields on the call chain.

See also:

*   [Go Tip #5: Slimming Your Client Libraries](https://google.github.io/styleguide/go/index.html#gotip)
*   [Go Tip #24: Use Case-Specific Constructions](https://google.github.io/styleguide/go/index.html#gotip)
*   [Go Tip #40: Improving Time Testability with Function Parameters](https://google.github.io/styleguide/go/index.html#gotip)
*   [Go Tip #41: Identify Function Call Parameters](https://google.github.io/styleguide/go/index.html#gotip)
*   [Go Tip #44: Improving Time Testability with Struct Fields](https://google.github.io/styleguide/go/index.html#gotip)
*   [Go Tip #80: Dependency Injection Principles](https://google.github.io/styleguide/go/index.html#gotip)

APIs that do not support explicit dependency passing become fragile as the
number of clients increases:

```go
// Bad:
package sidecar

var registry = make(map[string]*Plugin)

func Register(name string, p *Plugin) error { /* registers plugin in registry */ }
```

Consider what happens in the case of tests exercising code that transitively
relies on a sidecar for cloud logging.

```go
// Bad:
package app

import (
  "cloudlogger"
  "sidecar"
  "testing"
)

func TestEndToEnd(t *testing.T) {
  // The system under test (SUT) relies on a sidecar for a production cloud
  // logger already being registered.
  ... // Exercise SUT and check invariants.
}

func TestRegression_NetworkUnavailability(t *testing.T) {
  // We had an outage because of a network partition that rendered the cloud
  // logger inoperative, so we added a regression test to exercise the SUT with
  // a test double that simulates network unavailability with the logger.
  sidecar.Register("cloudlogger", cloudloggertest.UnavailableLogger)
  ... // Exercise SUT and check invariants.
}

func TestRegression_InvalidUser(t *testing.T) {
  // The system under test (SUT) relies on a sidecar for a production cloud
  // logger already being registered.
  //
  // Oops. cloudloggertest.UnavailableLogger is still registered from the
  // previous test.
  ... // Exercise SUT and check invariants.
}
```

Go tests are executed sequentially by default, so the tests above run as:

1.  `TestEndToEnd`
2.  `TestRegression_NetworkUnavailability`, which overrides the default value of
    cloudlogger
3.  `TestRegression_InvalidUser`, which requires the default value of
    cloudlogger registered in `package sidecar`

This creates an order-dependent test case, which breaks running with test
filters, and prevents tests from running in parallel or being sharded.

Using global state poses problems that lack easy answers for you and the API's
clients:

*   What happens if a client needs to use different and separately operating
    sets of `Plugin`s (for example, to support multiple servers) in the same
    process space?

*   What happens if a client wants to replace a registered `Plugin` with an
    alternative implementation in a test, like a [test double]?

    What happens if a client's tests require hermeticity between instances of a
    `Plugin`, or between all of the plugins registered?

*   What happens if multiple clients `Register` a `Plugin` under the same name?
    Which one wins, if any?

    How should errors be [handled](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#handle-errors)? If the code panics
    or calls `log.Fatal`, will that always be
    [appropriate for all places in which API would be called](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#dont-panic)?
    Can a client verify it doesn't do something bad before doing so?

*   Are there certain stages in a program's startup phases or lifetime during
    which `Register` can be called and when it can't?

    What happens if `Register` is called at the wrong time? A client could call
    `Register` in [`func init`](https://go.dev/ref/spec#Package_initialization),
    before flags are parsed, or after `main`. The stage at which a function is
    called affects error handling. If the author of an API assumes the API is
    *only* called during program initialization without the requirement that it
    is, the assumption may nudge the author to design error handling to
    [abort the program](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#program-init) by modeling the API as a
    `Must`-like function. Aborting is not appropriate for general-purpose
    library functions that can be used at any stage.

*   What if the client's and the designer's concurrency needs are mismatched?

See also:

*   [Go Tip #36: Enclosing Package-Level State](https://google.github.io/styleguide/go/index.html#gotip)
*   [Go Tip #71: Reducing Parallel Test Flakiness](https://google.github.io/styleguide/go/index.html#gotip)
*   [Go Tip #80: Dependency Injection Principles](https://google.github.io/styleguide/go/index.html#gotip)
*   Error Handling:
    [Look Before You Leap](https://docs.python.org/3/glossary.html#term-LBYL)
    versus
    [Easier to Ask for Forgiveness than Permission](https://docs.python.org/3/glossary.html#term-EAFP)
*   [Unit Testing Practices on Public APIs]

Global state has cascading effects on the
[health of the Google codebase](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#maintainability). Global state should
be approached with **extreme scrutiny**.

[Global state comes in several forms](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#globals-forms), and you can use a few
[litmus tests to identify when it is safe](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#globals-litmus-tests).

[Unit Testing Practices on Public APIs]: https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/index.md#unit-testing-practices

<a id="globals-litmus-tests"></a>

### Litmus tests

[APIs using the patterns above](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#globals-forms) are unsafe when:

*   Multiple functions interact via global state when executed in the same
    program, despite being otherwise independent (for example, authored by
    different authors in vastly different directories).
*   Independent test cases interact with each other through global state.
*   Users of the API are tempted to swap or replace global state for testing
    purposes, particularly to replace any part of the state with a
    [test double], like a stub, fake, spy, or mock.
*   Users have to consider special ordering requirements when interacting with
    global state: `func init`, whether flags are parsed yet, etc.

Provided the conditions above are avoided, there are a **few limited
circumstances under which these APIs are safe**, namely when any of the
following is true:

*   The global state is logically constant
    ([example](https://github.com/klauspost/compress/blob/290f4cfacb3eff892555a491e3eeb569a48665e7/zstd/snappy.go#L413)).
*   The package's observable behavior is stateless. For example, a public
    function may use a private global variable as a cache, but so long as the
    caller can't distinguish cache hits from misses, the function is stateless.
*   The global state does not bleed into things that are external to the
    program, like sidecar processes or files on a shared filesystem.
*   There is no expectation of predictable behavior
    ([example](https://pkg.go.dev/math/rand)).

> **Note:**
> [Sidecar processes](https://www.oreilly.com/library/view/designing-distributed-systems/9781491983638/ch02.html)
> may **not** strictly be process-local. They can and often are shared with more
> than one application process. Moreover, these sidecars often interact with
> external distributed systems.
>
> Further, the same stateless, idempotent, and local rules in addition to the
> base considerations above would apply to the code of the sidecar process
> itself!

An example of one of these safe situations is
[`package image`](https://pkg.go.dev/image) with its
[`image.RegisterFormat`](https://pkg.go.dev/image#RegisterFormat) function.
Consider the litmus tests from above applied to a typical decoder, like the one
for handling the [PNG](https://pkg.go.dev/image/png) format:

*   Multiple calls to `package image`'s APIs that use the registered decoders
    (for example, `image.Decode`) cannot interfere with one another, similarly
    for tests. The only exception is `image.RegisterFormat`, but that is
    mitigated by the points below.
*   It is extremely unlikely that a user would want to replace a decoder with a
    [test double], as the PNG decoder exemplifies a case in which our codebase's
    preference for real objects applies. However, a user would be more likely to
    replace a decoder with a test double if the decoder statefully interacted
    with operating system resources (for example, the network).
*   Collisions in registration are conceivable, though they are probably rare in
    practice.
*   The decoders are stateless, idempotent, and pure.

[test double]: https://abseil.io/resources/swe-book/html/ch13.html

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#globals-litmus-tests. Locally segmented; local links rewritten to this pinned revision. -->
