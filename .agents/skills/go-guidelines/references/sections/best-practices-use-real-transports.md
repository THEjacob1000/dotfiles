<a id="tests"></a>

## Tests

<a id="use-real-transports"></a>

### Use real transports

When testing component integrations, especially where HTTP or RPC are used as
the underlying transport between the components, prefer using the real
underlying transport to connect to the test version of the backend.

For example, suppose the code you want to test (sometimes referred to as "system
under test" or SUT) interacts with a backend that implements the
[long running operations] API. To test your SUT, use a real [OperationsClient]
that is connected to a
[test double](https://abseil.io/resources/swe-book/html/ch13.html#basic_concepts)
(e.g., a mock, stub, or fake) of the [OperationsServer].

[test double]: https://abseil.io/resources/swe-book/html/ch13.html#basic_concepts
[long running operations]: https://pkg.go.dev/google.golang.org/genproto/googleapis/longrunning
[OperationsClient]: https://pkg.go.dev/google.golang.org/genproto/googleapis/longrunning#OperationsClient
[OperationsServer]: https://pkg.go.dev/google.golang.org/genproto/googleapis/longrunning#OperationsServer

This is recommended over hand-implementing the client, due to the complexity of
imitating client behavior correctly. By using the production client with a
test-specific server, you ensure your test is using as much of the real code as
possible.

**Tip:** Where possible, use a testing library provided by the authors of the
service under test.

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#use-real-transports. Locally segmented; local links rewritten to this pinned revision. -->
