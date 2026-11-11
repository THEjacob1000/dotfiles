# Typed errors

Use `Result<T, E>` whenever an operation can fail, even when the cause seems obvious. Reserve `Option<T>` for a successful absence, such as a missing optional lookup. If a lookup can also fail, use `Result<Option<T>, E>`. A parser rejecting invalid input or arithmetic rejecting overflow returns `Result`; do not erase those failures with `.ok()`. This overrides Google's Option-for-simple-failure advice. Operational CLI failures also use `Result`; invariant failures follow the [panic policy](#panic-policy). Existing standard-library APIs retain their signatures; translate their `None` into the domain error when it represents failure in your API.

## Panic policy

Production code does not panic. Encode the invariant in a type; otherwise use `get`, `checked_*` or `try_from` and return a typed error naming the violated invariant, even for a state believed unreachable. Do not write `unwrap`, `expect`, `panic!`, `unreachable!`, `todo!`, `unimplemented!`, or indexing and slicing that can panic in non-test code. Defaults and sentinels are not substitutes for an invariant error.

The only production exception is an expression inside a signature that cannot carry an error, such as a trait method the crate does not own. Put one `#[expect(clippy::expect_used, reason = "<the invariant and why it holds>")]` on that expression.

Test code returns `Result`; where a panic-family lint must be excepted in test code, use one reasoned `#[expect(..., reason = "...")]` on the narrowest test item (module or function).

Where the repository denies panic-related operations, retain those checks. Numen denies `unwrap_used`, `expect_used`, `panic`, `indexing_slicing`, `string_slice`, `todo`, `unimplemented` and `exit` in all targets, with no configuration-wide test exemption. The policy also forbids `unreachable!`; that is not a claim that a configured lint denies it.

## Error boundaries

Use a focused error enum with `thiserror::Error` for each domain or subsystem whose failures callers need to distinguish. Keep the error near the boundary, usually in `error.rs`, and expose only the visibility callers require. Reuse an existing boundary rather than creating an enum for every function or one application-wide catalogue of every leaf failure.

- Derive `Debug` and `thiserror::Error`; derive `Clone`, `Copy`, `PartialEq` and `Eq` only when the payloads and contract support them. Never discard source errors or context to make an error `Copy`.
- Name variants for the failed operation or domain condition. Use named fields for useful context such as a path, identifier or current state. Keep rejection, cancellation, partial completion and unknown outcome distinct when they change recovery.
- Put human diagnostics in `#[error("...")]`; callers branch on variants and fields, never message text. Start fragment diagnostics lowercase and omit a final period; preserve proper names, quoted input and established public messages. Preserve typed outcomes for known subsystem failures; string catch-alls and `Box<dyn Error>` cannot replace recovery distinctions, including in private helpers. Retain outer reporting and deliberate redaction exceptions below.
- Preserve a cause using a `source` field or `#[source]`. `#[from]` also makes the wrapped error a source; use it only for an unambiguous, context-free conversion. When several operations return the same lower-level error, construct the operation-specific variant with `map_err` instead.
- Keep wrapper `Display` to its own operation and context when `source()` exposes the cause. Printing the cause there and again in a rendered source chain duplicates diagnostics; let one reporting boundary render the chain.
- Use `#[error(transparent)]` with `#[from]` to compose a lower-level domain error unchanged when its meaning and diagnostic are already right at this boundary. Do not wrap every dependency mechanically or add a redundant message at every layer.
- A local `type Result<T, E = Error> = std::result::Result<T, E>` is useful when the module repeatedly returns the same error. Follow existing visibility and re-export conventions; an exported domain alias such as `WalletError` can disambiguate `Error` at callers.
- Keep enums exhaustive by default. Adding a failure should force affected callers to reconsider handling. Do not add `#[non_exhaustive]` to an enum without an explicit API-evolution requirement.

This is the default for libraries and application subsystems. It overrides Microsoft's canonical-public-error-struct preference (`M-ERRORS-CANONICAL-STRUCTS`) and qualifies `M-FROM-ERROR`: automatic conversion must not lose operation context. `anyhow` or another erased report may remain only where the error is rendered and the process exits (a binary's `main` or its single reporting function); every function below it returns a typed error. `M-APP-ERROR` does not justify erasing errors throughout an application. Preserve established public contracts unless the task includes migrating them.

## Shape

```rust
//! Reading settings with typed operation context.

use std::fs;
use std::io;
use std::path::{Path, PathBuf};

/// A result from the settings boundary.
pub type Result<T, E = Error> = std::result::Result<T, E>;

/// Failures while loading settings.
#[derive(Debug, thiserror::Error)]
pub enum Error {
    /// The settings file could not be read.
    #[error("failed to read settings from {path}", path = path.display())]
    Read {
        /// The file requested by the caller.
        path: PathBuf,
        /// The underlying filesystem failure.
        source: io::Error,
    },
    /// The file contained no non-whitespace text.
    #[error("settings must not be empty")]
    Empty,
}

/// Reads a nonempty settings file.
///
/// # Errors
///
/// Returns [`Error::Read`] when the file cannot be read or [`Error::Empty`]
/// when it holds only whitespace.
pub fn read_settings(path: &Path) -> Result<String> {
    let text = fs::read_to_string(path).map_err(|source| Error::Read {
        path: path.to_owned(),
        source,
    })?;
    if text.trim().is_empty() {
        return Err(Error::Empty);
    }
    Ok(text)
}

/// Failures reported by the settings command.
#[derive(Debug, thiserror::Error)]
pub enum CommandError {
    /// A failure at the settings boundary.
    #[error(transparent)]
    Settings(#[from] Error),
}
```

`Read` needs the path from its call site, so a blanket `From<io::Error>` would be insufficient. `CommandError::Settings` adds no new meaning, so `#[from]` and transparent forwarding are appropriate.

## Diagnostics are an output boundary

Preserving a source is the default, not permission to expose secrets. Review `Display`, `Debug` and the entire `Error::source()` chain. A database driver or config parser may retain credentials, row values or input text. At a redaction boundary, retain the underlying error privately for classification where needed, provide safe diagnostics, and omit it from the public source chain. `#[from]`, `#[source]`, a field named `source`, transparent forwarding and derived `Debug` can each expose it. Use an explicit conversion and custom `Debug` when required; test all diagnostic surfaces for the sensitive value.

Emit a failure at the boundary that owns reporting or recovery rather than logging the same propagated error at every layer. Use structured operation/outcome fields and bounded, safe context. Expected absence, rejection and retry state are not automatically warnings; retain diagnostics for actionable failures and do not silently discard an error to reduce noise. Verify event count/severity as well as redaction when changing observability. A sanitized erased cause can be justified at a dependency boundary, but callers that need recovery distinctions must retain a typed outcome.

Test meaningful variants and context at failure boundaries, conversion/source preservation where promised, and recovery distinctions. Do not make a text snapshot the only evidence of error semantics.

## Local examples

In the Numen repository, these files show the pattern; elsewhere, find the nearest equivalent boundary in the current workspace:

- `crates/core/numen-config/src/duration.rs`: copy `DurationError`'s exhaustive refusal variants and structured unit context, keeping successful absence separate from invalid present input.
- `crates/core/numen-modelwire/src/error.rs`: copy `CodecError`'s typed category and location at a redaction boundary, without retaining input-bearing parser errors in `Display`, `Debug` or `source()`.
