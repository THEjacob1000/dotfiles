# Go reductions

Use this when the target is Go. The useful reduction is one fewer representation, policy, owner, or layer, not a shorter spelling. Readability is a hard acceptance condition: if a shorter version makes a maintainer decipher dense expressions, clever chains, compressed names, generic machinery, hidden effects, or indirection, keep the longer clear version. Count what a reader must understand, not lines. Keep the repo's minimum Go version, public API, wire format, and runtime behavior fixed unless the requested change explicitly permits otherwise. For the general candidate and proof process, use [workflow](workflow.md) and [proof and tests](proof-and-tests.md); this page covers the Go-specific decisions.

## Replace code with the right native operation

Look for hand-written membership, sorting, copying, clearing, splitting, joining, encoding, buffering, and error traversal. The replacement must have the same *contract*, not just the same output on a happy-path example. `strings.Contains` searches substrings, not tokens; `strings.Split` preserves empty fields while `strings.Fields` splits whitespace and discards them. Byte indexing is not rune indexing. `copy` copies `min(len(dst), len(src))` elements, not an entire backing array; `append` may reuse the receiver's backing array. `slices.Sort` modifies its input and isn't a stable sort; retain a stable sort when ties carry meaning. `maps.Clone` copies entries, not reachable values behind pointers or slices. `clear` removes map entries or zeroes slice elements, whereas resetting a slice's length leaves elements in its backing array. Check the package documentation and ownership before deleting the loop. [Strings](https://pkg.go.dev/strings), [builtin `copy`, `append`, `clear`](https://pkg.go.dev/builtin), [slices](https://pkg.go.dev/slices), [maps](https://pkg.go.dev/maps).

```go
// Before: repeated search policy in a private helper.
func hasID(ids []int, want int) bool {
    for _, id := range ids {
        if id == want {
            return true
        }
    }
    return false
}

// After (Go 1.21+): same equality and membership semantics.
found := slices.Contains(ids, want)
```

Do not replace the loop if it deliberately short-circuits around an expensive conversion, uses a custom equivalence relation, or the supported Go version lacks `slices.Contains`. A readable loop is often the smallest honest implementation. Do not build a generic search wrapper around `slices.Contains`.

## Keep concrete types until substitution pays for itself

If there is one implementation and all callers need that implementation, remove a speculative `Store`/`storeImpl`/fake triple and use the concrete type. Usually return the concrete type, which lets callers use its whole API. Keep a *small consumer-owned* interface when actual implementations must be substituted, a package boundary needs decoupling, or the consumer genuinely needs a narrower capability. `io.Reader`, `io.Writer`, `http.RoundTripper`, and generated protocol interfaces can already be the right seam; don't wrap them just to produce a new name. A single implementation can still sit behind a required plugin, security, transport, or architecture boundary. [Go interface guidance](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#interfaces), [unnecessary interfaces](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#avoid-unnecessary-interfaces).

```go
// Before: the interface repeats the only implementation's methods.
type counter interface {
    Add(int)
    Value() int
}
type Counter struct {
    total int
}
func (c *Counter) Add(n int) { c.total += n }
func (c *Counter) Value() int { return c.total }
func newCounter() counter {
    return &Counter{}
}

// After: keep Counter and its methods; delete counter and return the concrete type.
func newCounter() *Counter {
    return &Counter{}
}
```

That example is a *shape*, not a license to rename exported APIs or delete behavior. Changing an exported return type can break assignments, method-set expectations, mocks, and callers outside the repo; preserve a supported API or get authorization for a migration. Inspect call sites before removing an interface. A function parameter such as `func Walk(nodes []Node, visit func(Node) error) error` is a useful seam when callers genuinely supply behavior; a nest of callback factories introduced only to mock one call isn't. Generics can eliminate a genuinely repeated type-safe algorithm, but one instantiation needs no type parameter, and `any` plus type switches usually makes the boundary less honest. Don't replace straightforward loops with generic combinators to reduce lines. Go type parameters arrived in 1.18; check constraints, inference and the supported version before a generic substitution. [Go 1.18](https://go.dev/doc/go1.18), [generics guidance](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#generics).

## Delete duplicate representations and state

A repeated derived field creates a synchronization obligation. If `count` always equals `len(items)`, compute `len(items)`; if a `byID` map is always derived from `items`, consider one canonical collection *when lookup cost permits*. Delete a config option only when no caller, environment, deployment, wire input, or test relies on selecting its policy. A builder that merely copies already-known fields into a struct can become a literal or a checked constructor; retain one that enforces invariants, provides a real staged API, or makes conditional assembly clearer. Prefer one owner for mutable state; moving duplicate updates into a helper without removing the duplicate representation does not solve drift.

```go
// Before: the count must be updated on every write path.
type Queue struct {
    items []Job
    count int
}
func (q *Queue) Len() int { return q.count }

// After: if count is exactly the number of queued jobs.
type Queue struct { items []Job }
func (q *Queue) Len() int { return len(q.items) }
```

Refuse this change if `count` includes in-flight jobs, is an atomic snapshot exposed to concurrent callers, or intentionally counts something other than the slice. Removing a cache can worsen a measured hot path; compare the actual cost. Do not replace real per-request configuration with a mutable package global. An injected clock, codec, or strategy may be one implementation today yet still encode an explicit swappability requirement.

Zero values remove some constructors and eager allocation. A nil slice supports `len`, `range`, and `append`; a nil map supports reads and `len`, but assigning to it panics. `bytes.Buffer`, `sync.Mutex`, and `sync.WaitGroup` have useful zero values; copying a mutex or wait group after use is a separate hazard. An exported wrapper with private fields is *still* externally zero-constructible (`var x T`, `T{}`, `new(T)`); private fields do not prove its zero value valid. Constructors may reject invalid values, but operations must either support zero/nil or detect invalid state where it matters. Named primitive types permit explicit conversions, and decoding/reflection can bypass a constructor's intended route. Don't delete validation on the theory that callers cannot create a bad value. [Go spec: zero values and composite literals](https://go.dev/ref/spec), [sync](https://pkg.go.dev/sync), [bytes.Buffer](https://pkg.go.dev/bytes#Buffer).

## Nil and aliasing are observable

For slices and maps, `nil` and allocated-empty collections both have length zero; they need not serialize alike. With `encoding/json`, a nil slice/map becomes `null`, while a nonnil empty slice/map becomes `[]`/`{}`. `omitempty` can omit either when used on a field; pointer fields and `omitzero` (where supported) have different rules. `reflect.DeepEqual` distinguishes nil and nonnil empty slices. Preserve omission, `null`, and empty-collection semantics if clients use them to express absent/clear/replace or a database/codec distinguishes them. A conversion to `nil` is not merely an allocation optimization. [encoding/json `Marshal`](https://pkg.go.dev/encoding/json#Marshal), [reflect.DeepEqual](https://pkg.go.dev/reflect#DeepEqual).

```go
// Before: [] is part of the response contract.
items := make([]Item, 0)
return json.Marshal(struct { Items []Item `json:"items"` }{items})

// Unsafe reduction: nil items would encode as {"items":null}.
var items []Item
```

A subslice shares a backing array. `out := input[:0]` is an efficient in-place filter only if overwriting `input` is allowed and retaining its backing array/lifetime is safe. `append` can mutate storage reachable from another slice. `slices.Clone` or `append([]T(nil), src...)` copies the slice elements when ownership must diverge, but not the nested objects, maps, or slices. Check whether an empty result must be nil or nonnil: `slices.Clone` preserves nil input's nilness and may return nonnil empty from nonnil empty input; a hand-written append-to-nil variant does not promise that same distinction. Sorting a borrowed slice changes the caller's order; clone before sorting if ownership stays with the caller. [Go slices internals](https://go.dev/blog/slices-intro), [slices.Clone](https://pkg.go.dev/slices#Clone), [Go spec: slice expressions](https://go.dev/ref/spec#Slice_expressions).

Map iteration order is unspecified and not guaranteed to be the same from one iteration to the next. Do not replace sorted-key traversal with `range` when output, tie-breaking, snapshots, or tests require order; conversely, delete sorting only where order is explicitly irrelevant. `encoding/json` orders map keys during marshaling, which does *not* make ordinary `range` deterministic. [Go spec: range](https://go.dev/ref/spec#For_statements), [encoding/json](https://pkg.go.dev/encoding/json#Marshal).

## Errors and cleanup are part of the result

Collapse bespoke forwarding errors into `fmt.Errorf("load %s: %w", name, err)` where useful context and traversal are retained. `errors.Is` and `errors.As` inspect wrapped identities/types; direct `==` and type assertions do not traverse a wrapping chain. `%v` formats an error without wrapping it. A wrapper may be required if it carries fields or is part of a public contract. A generic `catch-all` that changes all failures to one sentinel, logs and returns the same error at every layer, or drops causes is not a reduction. Preserve errors from `Close`, `Flush`, `Commit`, and rollback when their failure affects the operation; don't defer and ignore them merely to remove branches. [Go errors](https://go.dev/blog/go1.13-errors), [errors](https://pkg.go.dev/errors), [fmt.Errorf](https://pkg.go.dev/fmt#Errorf).

```go
// Before: forwarding adds no context or other work.
func load(ctx context.Context) error {
    if err := read(ctx); err != nil {
        return err
    }
    return nil
}

// After: same error identity, return value, and call count.
func load(ctx context.Context) error {
    return read(ctx)
}
```

Wrapping is itself an API decision: don't start exposing a previously hidden dependency error through `%w` without considering callers. An `error` interface holding a nil `*MyError` is non-nil; check the concrete pointer before returning it, rather than deleting a conversion/guard because it *looks* nil. [Go FAQ: nil error](https://go.dev/doc/faq#nil_error), [errors.Is](https://pkg.go.dev/errors#Is).

`defer` eliminates repeated cleanup paths after successful acquisition, but its function and arguments are evaluated when the defer statement executes; a deferred closure observes captured variables later. In a long loop, deferred closes execute when the surrounding function returns, not at the end of each iteration; extract a one-item function or close per iteration if prompt release matters. A callback closure capturing a range variable also depends on the language version: Go 1.22's per-iteration variables apply to packages whose module declares `go 1.22` or later, with compatibility controls for earlier modules. Verify the module version before simplifying capture code. [Defer](https://go.dev/blog/defer-panic-and-recover), [Go 1.22 loop variables](https://go.dev/blog/loopvar), [Go 1.22 release notes](https://go.dev/doc/go1.22).

```go
// Tempting, but refuse: this version returns a failed Close.
f, err := os.Open(name)
if err != nil {
    return err
}
if err := consume(f); err != nil {
    f.Close()
    return err
}
return f.Close()

// Not equivalent: it silently discards a failed Close.
f, err := os.Open(name)
if err != nil {
    return err
}
defer f.Close()
return consume(f)
```

Keep the returned close failure if it's contractual; factor the operation so cleanup stays local and retain the existing error precedence. If an existing path already ignores close errors, `defer` may remove repeated cleanup without changing that behavior, but establish that contract first.

## Concurrency, cancellation and ownership

A sequential operation doesn't need a worker goroutine, a result channel, a queue and a `WaitGroup` just to return one value. Collapse that machinery when timing, ordering, responsiveness and ownership are unchanged. Keep the concurrency when parallelism, streaming, isolation, bounded buffering, or shutdown behavior is part of the contract. Goroutines must have a path to finish; removing a `Wait` can leave work running after return. Context cancellation only signals cooperative code: the worker must check the context or call APIs that do. Preserve deadline propagation rather than replacing an incoming context with `context.Background()`. Call `CancelFunc` when done to release associated resources; stop timers when no longer needed and account for timer-channel/version semantics before changing drain logic. [context](https://pkg.go.dev/context), [time.Timer](https://pkg.go.dev/time#Timer), [goroutine lifetime guidance](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#goroutine-lifetimes).

```go
// Before: goroutine and channel add no concurrency to an already synchronous call.
ch := make(chan result, 1)
go func() { value, err := fetch(ctx); ch <- result{value, err} }()
r := <-ch
return r.value, r.err

// After: when fetch has the same lifetime and cancellation contract.
return fetch(ctx)
```

Do not apply the after-form if the goroutine intentionally runs independently, multiple fetches race/parallelize, or the caller selects between its result and cancellation. A buffered result channel avoids one blocked send but does not stop the work. For channels, identify who sends, who receives, who closes, and how blocked peers exit. Send on closed channels panics; reading a closed channel yields a zero value plus `ok=false`. Directional channel types can express an ownership-facing API without a new interface. [Go spec: channel types and receive](https://go.dev/ref/spec#Channel_types), [Go memory model](https://go.dev/ref/mem).

Plain map reads concurrent with writes or concurrent writes require synchronization or single-goroutine ownership. A mutex is not redundant just because the current test only starts one goroutine; `sync.Map` has specialized cases and is not a universal shorter replacement. Reducing lock scope changes the atomic unit, and moving a map behind a channel changes lifetime/backpressure. Preserve the happens-before relationship, shutdown path and error/result order. A focused race run can find executions with data races but cannot establish absence for unexercised schedules. [Map safety](https://go.dev/blog/maps), [Go memory model](https://go.dev/ref/mem), [sync.Map](https://pkg.go.dev/sync#Map).

## Preserve decoding, reachability, and version boundaries

Replacing an encoder/decoder or custom parser requires an exact input/output contract: field names/tags, omitted versus null versus empty, numeric precision and overflow, accepted unknown and duplicate fields, trailing data, malformed input, HTML escaping, map-key ordering, case-insensitive JSON field matching, and custom `MarshalJSON`/`UnmarshalJSON` methods. `json.Unmarshal` into an existing value can reuse and mutate existing maps/slices; a fresh destination may behave differently. `Decoder.DisallowUnknownFields` rejects unknown object fields where the default decoder accepts them. A `Decoder.Decode` call can successfully read one value and leave a trailing value for later; a boundary requiring exactly one document must check for it. Don't swap `UseNumber` for default `float64` when exact numbers matter. Prove both accepted and rejected inputs before removing parser code. [encoding/json](https://pkg.go.dev/encoding/json), [Decoder](https://pkg.go.dev/encoding/json#Decoder).

Textual references are not the entire reachability graph. A Go implementation may be selected by `//go:build`, `GOOS`/`GOARCH`, cgo, or custom build tags; invoked by generated code, `init` registration, reflection, interfaces, plugins, tests in another module, or external clients. Deleting a file because the current default build has no direct caller can remove a platform implementation or a runtime registration. Inspect generator directives and checked-in generated output together, not just the editable template. Confirm what builds for each supported configuration before retiring a symbol or compatibility branch. [Build constraints](https://pkg.go.dev/cmd/go#hdr-Build_constraints), [go generate](https://pkg.go.dev/cmd/go#hdr-Generate_Go_files_by_processing_source), [reflect](https://pkg.go.dev/reflect), [plugin](https://pkg.go.dev/plugin).

| Change | Minimum version / compatibility check |
| --- | --- |
| Type parameters or generic syntax | Go 1.18; check module `go` directive and supported builders. [Go 1.18](https://go.dev/doc/go1.18) |
| Standard `slices`/`maps`, builtin `clear` | Go 1.21; individual functions may be newer, so check each API's docs. [Go 1.21](https://go.dev/doc/go1.21) |
| Per-iteration `for` variable capture semantics | Go 1.22 language semantics for modules declaring `go 1.22` or later; don't infer from installed compiler alone. [Go 1.22](https://go.dev/doc/go1.22) |
| Build constraints and legacy toolchains | Check the oldest toolchain's recognized build-tag syntax and each targeted build tuple. [Build constraints](https://pkg.go.dev/cmd/go#hdr-Build_constraints) |
| Timer reset/stop/channel behavior | Go 1.23 changed timer-channel behavior; check module/toolchain and any compatibility switches before deleting drain logic. [Go 1.23](https://go.dev/doc/go1.23) |

## Evidence to keep, change, or refuse

For a candidate, name the observable difference that would disprove equivalence: `null` versus `[]`, `errors.Is` result, ordered output, shared backing-array mutation, rejected JSON, timeout/shutdown, close failure, or an alternate build target. Compile under the repo's supported toolchain; run the changed consumer path and a targeted boundary check where the distinction is plausible. For concurrency, exercise cancellation/shutdown and the race detector on the relevant path, without treating one passing run as a proof of no races. For build-tagged code, check each supported configuration rather than only the host build. Static absence of callers is a lead, not a proof against dynamic registration or consumers outside the repository.

Keep a behavior test if a plausible future regression would fail it. Migrate a test when the same public obligation moves to a new implementation; retire an internal-structure test only when its obligation disappears and project policy permits removal. Do not retarget tests merely to make an invalid reduction green or delete an error/serialization/concurrency boundary test to lower test count. If an interface, lock, validation branch, explicit empty allocation, or second implementation protects a real contract, record the refused candidate and leave it intact. [Proof and tests](proof-and-tests.md) covers the shared evidence ladder and test disposition.
