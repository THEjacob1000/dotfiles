# Typed errors

Read [Typed error boundaries](../typed-errors.md) before adding or changing an
error boundary. It covers repository precedence over Google guidance, focused
`thiserror::Error` enums, explicit conversion and source preservation, outer
reporting boundaries, redaction, examples and meaningful recovery tests.

Use `Result` for failures and `Option` for successful absence. Keep rejection,
cancellation, partial completion and unknown outcomes distinct when recovery
depends on them. Follow established public contracts and surrounding code.
