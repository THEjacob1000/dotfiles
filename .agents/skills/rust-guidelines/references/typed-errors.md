# Typed errors

Use `Result<T, E>` whenever an operation can fail, even when the cause seems obvious. Reserve `Option<T>` for a successful absence, such as a missing optional lookup. If a lookup can also fail, use `Result<Option<T>, E>`. A parser rejecting invalid input or arithmetic rejecting overflow returns `Result`; do not erase those failures with `.ok()`. This overrides Google's Option-for-simple-failure advice. Operational CLI failures also use `Result`, overriding its developer-binary panic exception; true invariant bugs follow repository policy. Existing standard-library APIs retain their signatures; translate their `None` into the domain error when it represents failure in your API.

## Error boundaries

Use a focused error enum with `thiserror::Error` for each domain or subsystem whose failures callers need to distinguish. Keep the error near the boundary, usually in `error.rs`, and expose only the visibility callers require. Reuse an existing boundary rather than creating an enum for every function or one application-wide catalogue of every leaf failure.

- Derive `Debug` and `thiserror::Error`; derive `Clone`, `Copy`, `PartialEq` and `Eq` only when the payloads and contract support them. Never discard source errors or context to make an error `Copy`.
- Name variants for the failed operation or domain condition. Use named fields for useful context such as a path, identifier or current state. Keep rejection, cancellation, partial completion and unknown outcome distinct when they change recovery.
- Put the human diagnostic in `#[error("...")]`; callers branch on variants and fields, never message text. Avoid string-only catch-all variants for known failures.
- Preserve a cause using a `source` field or `#[source]`. `#[from]` also makes the wrapped error a source; use it only for an unambiguous, context-free conversion. When several operations return the same lower-level error, construct the operation-specific variant with `map_err` instead.
- Use `#[error(transparent)]` with `#[from]` to compose a lower-level domain error unchanged when its meaning and diagnostic are already right at this boundary. Do not wrap every dependency mechanically or add a redundant message at every layer.
- A local `type Result<T, E = Error> = std::result::Result<T, E>` is useful when the module repeatedly returns the same error. Follow existing visibility and re-export conventions; an exported domain alias such as `WalletError` can disambiguate `Error` at callers.
- Keep enums exhaustive by default. Adding a failure should force affected callers to reconsider handling. Do not add `#[non_exhaustive]` to an enum without an explicit API-evolution requirement.

This is the default for libraries and application subsystems. It overrides Microsoft's canonical-public-error-struct preference (`M-ERRORS-CANONICAL-STRUCTS`) and qualifies `M-FROM-ERROR`: automatic conversion must not lose operation context. `anyhow` or another erased report may remain at an outer application reporting boundary where nobody needs typed recovery; `M-APP-ERROR` does not justify erasing errors throughout the application. Preserve established public contracts unless the task includes migrating them.

## Shape

```rust
use std::fs;
use std::io;
use std::path::{Path, PathBuf};

pub type Result<T, E = Error> = std::result::Result<T, E>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("failed to read settings from {path}: {source}", path = path.display())]
    Read { path: PathBuf, source: io::Error },
    #[error("settings must not be empty")]
    Empty,
}

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

#[derive(Debug, thiserror::Error)]
pub enum CommandError {
    #[error(transparent)]
    Settings(#[from] Error),
}
```

`Read` needs the path from its call site, so a blanket `From<io::Error>` would be insufficient. `CommandError::Settings` adds no new meaning, so `#[from]` and transparent forwarding are appropriate.

## Diagnostics are an output boundary

Preserving a source is the default, not permission to expose secrets. Review `Display`, `Debug` and the entire `Error::source()` chain. A database driver or config parser may retain credentials, row values or input text. At a redaction boundary, retain the underlying error privately for classification where needed, provide safe diagnostics, and omit it from the public source chain. `#[from]`, `#[source]`, a field named `source`, transparent forwarding and derived `Debug` can each expose it. Use an explicit conversion and custom `Debug` when required; test all diagnostic surfaces for the sensitive value.

Test meaningful variants and context at failure boundaries, conversion/source preservation where promised, and recovery distinctions. Do not make a text snapshot the only evidence of error semantics.

## Local examples

The pattern comes from these source locations, not a dependency on their presence when using this skill:

- `loke-rs/crates/loke-sale/src/error.rs`: exhaustive domain variants, local `Result`, transparent composition of kernel/wallet/loyalty errors and structured state payloads.
- `tools/tools/loke-cli/src/error.rs`: an application error composes subsystem enums with transparent `#[from]` variants.
- `tools/tools/loke-cli/src/db/error.rs`: distinct operation variants for the same I/O source and separate partial/unknown-outcome errors.
- `loke-rs/crates/loke-storage-postgres/src/error.rs`: driver errors retained for classification while custom `Debug`, safe `Display` and no driver source chain prevent data leakage.
