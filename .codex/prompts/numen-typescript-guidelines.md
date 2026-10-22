# /typescript-guidelines

Write, refine or review TypeScript and JavaScript. Check runtime boundaries, asynchronous resource ownership, package contracts and supported compiler/runtime targets; use repository conventions for style.

# TypeScript and JavaScript guidelines

Read the owning package's scripts, compiler configuration and consumers before changing its contract. Resolve the package manager, runtime, test runner and deployment targets separately. Repository policy wins; use `code-golf` for simplification and proof rules, and `code-refinement` for a staged sweep. Apply the relevant decisions below within the requested scope. JavaScript packages retain their own checks and runtime contracts; this skill does not require migrating them to TypeScript.

## Types and runtime boundaries

Model distinct valid states with discriminated unions and narrow public inputs. Prefer inference inside an implementation and deliberate types at exported seams. Use `unknown` for untrusted data and validate at the boundary with the project's existing parser or schema. Inspect every path that constructs the internal type, including deserialization, JavaScript callers and mutation through aliases. A type assertion or a predicate's annotation cannot establish that runtime validation happened. Preserve tests for malformed external input even when internal callers are typed. See the [TypeScript narrowing reference](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) when deciding whether control flow actually proves an invariant.

Treat optional, absent and explicitly undefined values according to the consumer's contract, especially in patches and serialization. Review empty strings, zero and false before replacing checks with truthiness. Keep runtime error distinctions and causes that callers use; replace a broad catch only after inspecting failure and cleanup paths. Avoid `any`, non-null assertions and suppressions as substitutes for modeling the real boundary.

## Async ownership

For each started task, identify who observes failure, requests cancellation and waits for shutdown. Preserve ordering and backpressure when replacing sequential work with concurrency. Bound fan-out to the resource being consumed; exercise partial failure and cancellation through the public entry point. A promise aggregation primitive is not a resource owner: verify what happens to sibling operations when one fails. Detached tasks need an explicit lifetime and error owner.

Pair acquired resources with cleanup on success, error and cancellation: streams, handles, listeners, timers, subscriptions and transactions. Use the repository's established lifecycle mechanism and supported runtime APIs. Check whether cleanup is asynchronous and whether it masks the original failure. Review shared mutable state across awaits; compile-time types alone do not establish ordering or isolation.

## Package and runtime contracts

Check `exports`, declaration output, package `type`, import specifiers, side-effect imports and downstream consumers before changing module structure. Type-only imports and runtime imports have different obligations; preserve initialization that callers rely on. Match module resolution to the actual host and build path, including ESM/CommonJS or browser/server variants the package supports. Follow the [TypeScript module model](https://www.typescriptlang.org/docs/handbook/modules/theory.html) for uncertain resolution behavior.

Keep compiler version, `target`, `lib`, runtime version and bundler capabilities distinct. A successful typecheck does not prove an API exists on the deployed runtime. Check feature support before adopting newer syntax or platform APIs; preserve the declared support floor. The [`target` reference](https://www.typescriptlang.org/tsconfig/target.html) explains emitted syntax and default library selection. For project references and generated declarations, use the repository's actual build/typecheck route rather than substituting a standalone source-file compile.

## Verification

Run the owning package's existing typecheck, lint and behavioral checks, plus affected consumers when exports or declarations change. Exercise the actual runtime/build path when changing module loading, cancellation or resource ownership. Use contract-level regression evidence for the failure being fixed; a compiler check cannot replace runtime validation or lifecycle tests. Record each supported variant exercised, existing failures and unavailable checks. Keep new compiler strictness or lint-policy changes separate unless requested; repair the code under its selected gate.
