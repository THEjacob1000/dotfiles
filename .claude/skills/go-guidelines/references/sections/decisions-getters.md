<a id="naming"></a>

## Naming

See the naming section within [the core style guide](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#naming) for
overarching guidance on naming. The following sections provide further
clarification on specific areas within naming.

<a id="getters"></a>

### Getters

<a id="TOC-Getters"></a>

Function and method names should not use a `Get` or `get` prefix, unless the
underlying concept uses the word "get" (e.g. an HTTP GET). Prefer starting the
name with the noun directly, for example use `Counts` over `GetCounts`.

If the function involves performing a complex computation or executing a remote
call, a different word like `Compute` or `Fetch` can be used in place of `Get`,
to make it clear to a reader that the function call may take time and could
block or fail.

<!--#include file="/go/g3doc/style/includes/special-name-exception.md"-->

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#getters. Locally segmented; local links rewritten to this pinned revision. -->
