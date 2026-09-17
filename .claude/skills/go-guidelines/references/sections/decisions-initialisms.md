<a id="naming"></a>

## Naming

See the naming section within [the core style guide](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#naming) for
overarching guidance on naming. The following sections provide further
clarification on specific areas within naming.

<a id="initialisms"></a>

### Initialisms

<a id="TOC-Initialisms"></a>

Words in names that are initialisms or acronyms (e.g., `URL` and `NATO`) should
have the same case. `URL` should appear as `URL` or `url` (as in `urlPony`, or
`URLPony`), never as `Url`. As a general rule, identifiers (e.g., `ID` and `DB`)
should also be capitalized similar to their usage in English prose.

*   In names with multiple initialisms (e.g. `XMLAPI` because it contains `XML`
    and `API`), each letter within a given initialism should have the same case,
    but each initialism in the name does not need to have the same case.
*   In names with an initialism containing a lowercase letter (e.g. `DDoS`,
    `iOS`, `gRPC`), the initialism should appear as it would in standard prose,
    unless you need to change the first letter for the sake of [exportedness].
    In these cases, the entire initialism should be the same case (e.g. `ddos`,
    `IOS`, `GRPC`).

[exportedness]: https://golang.org/ref/spec#Exported_identifiers

<!-- Keep this table narrow. If it must grow wider, replace with a list. -->

English Usage | Scope      | Correct  | Incorrect
------------- | ---------- | -------- | --------------------------------------
XML API       | Exported   | `XMLAPI` | `XmlApi`, `XMLApi`, `XmlAPI`, `XMLapi`
XML API       | Unexported | `xmlAPI` | `xmlapi`, `xmlApi`
iOS           | Exported   | `IOS`    | `Ios`, `IoS`
iOS           | Unexported | `iOS`    | `ios`
gRPC          | Exported   | `GRPC`   | `Grpc`
gRPC          | Unexported | `gRPC`   | `grpc`
DDoS          | Exported   | `DDoS`   | `DDOS`, `Ddos`
DDoS          | Unexported | `ddos`   | `dDoS`, `dDOS`
ID            | Exported   | `ID`     | `Id`
ID            | Unexported | `id`     | `iD`
DB            | Exported   | `DB`     | `Db`
DB            | Unexported | `db`     | `dB`
Txn           | Exported   | `Txn`    | `TXN`

<!--#include file="/go/g3doc/style/includes/special-name-exception.md"-->

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#initialisms. Locally segmented; local links rewritten to this pinned revision. -->
