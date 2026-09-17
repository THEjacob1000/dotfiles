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

<a id="naming-doubles-helper-package"></a>

#### Creating test helper packages

Suppose you want to create a package that contains test doubles for another.
We'll use `package creditcard` (from above) for this example:

One approach is to introduce a new Go package based on the production one for
testing. A safe choice is to append the word `test` to the original package name
("creditcard" + "test"):

```go
// Good:
package creditcardtest
```

Unless stated explicitly otherwise, all examples in the sections below are in
`package creditcardtest`.

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#naming-doubles-helper-package. Locally segmented; local links rewritten to this pinned revision. -->
