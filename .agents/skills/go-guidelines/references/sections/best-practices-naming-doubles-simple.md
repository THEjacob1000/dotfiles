<a id="naming"></a>

## Naming

<a id="naming-doubles"></a>

### Test double and helper packages

There are several disciplines you can apply to [naming] packages and types that
provide test helpers and especially [test doubles]. A test double could be a
stub, fake, mock, or spy.

These examples mostly use stubs. Update your names accordingly if your code uses
fakes or another kind of test double.

[naming]: https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#naming
[test doubles]: https://abseil.io/resources/swe-book/html/ch13.html#basic_concepts

Suppose you have a well-focused package providing production code similar to
this:

```go
package creditcard

import (
    "errors"

    "path/to/money"
)

// ErrDeclined indicates that the issuer declines the charge.
var ErrDeclined = errors.New("creditcard: declined")

// Card contains information about a credit card, such as its issuer,
// expiration, and limit.
type Card struct {
    // omitted
}

// Service allows you to perform operations with credit cards against external
// payment processor vendors like charge, authorize, reimburse, and subscribe.
type Service struct {
    // omitted
}

func (s *Service) Charge(c *Card, amount money.Money) error { /* omitted */ }
```

<a id="naming-doubles-simple"></a>

#### Simple case

You want to add a set of test doubles for `Service`. Because `Card` is
effectively a dumb data type, similar to a Protocol Buffer message, it needs no
special treatment in tests, so no double is required. If you anticipate only
test doubles for one type (like `Service`), you can take a concise approach to
naming the doubles:

```go
// Good:
import (
    "path/to/creditcard"
    "path/to/money"
)

// Stub stubs creditcard.Service and provides no behavior of its own.
type Stub struct{}

func (Stub) Charge(*creditcard.Card, money.Money) error { return nil }
```

This is strictly preferable to a naming choice like `StubService` or the very
poor `StubCreditCardService`, because the base package name and its domain types
imply what `creditcardtest.Stub` is.

Finally, if the package is built with Bazel, make sure the new `go_library` rule
for the package is marked as `testonly`:

```build
# Good:
go_library(
    name = "creditcardtest",
    srcs = ["creditcardtest.go"],
    deps = [
        ":creditcard",
        ":money",
    ],
    testonly = True,
)
```

The approach above is conventional and will be reasonably well understood by
other engineers.

See also:

*   [Go Tip #42: Authoring a Stub for Testing](https://google.github.io/styleguide/go/index.html#gotip)

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#naming-doubles-simple. Locally segmented; local links rewritten to this pinned revision. -->
