# Logging and Debugging

Sometimes logging code or debugging code can slow down a program significantly.
Either the logging/debugging code itself is slow, or data collection code that
feeds into logging/debugging code is slow. Make sure that no unnecessary work
is done for logging/debugging purposes when logging/debugging is not enabled.
[**Example 1**](https://github.com/rust-lang/rust/pull/50246/commits/2e4f66a86f7baa5644d18bb2adc07a8cd1c7409d),
[**Example 2**](https://github.com/rust-lang/rust/pull/75133/commits/eeb4b83289e09956e0dda174047729ca87c709fe),
[**Example 3**](https://github.com/rust-lang/rust/pull/147293/commits/cb0f969b623a7e12a0d8166c9a498e17a8b5a3c4).

[`assert!`] calls always run, whereas [`debug_assert!`] calls run when
`debug-assertions` is enabled (by default in dev but not release builds).
Only replace an assertion after profiling, and never when disabling it could
make unsafe code unsound.
[**Example 1**](https://github.com/rust-lang/rust/pull/58210/commits/f7ed6e18160bc8fccf27a73c05f3935c9e8f672e),
[**Example 2**](https://github.com/rust-lang/rust/pull/90746/commits/580d357b5adef605fc731d295ca53ab8532e26fb).

[`assert!`]: https://doc.rust-lang.org/std/macro.assert.html
[`debug_assert!`]: https://doc.rust-lang.org/std/macro.debug_assert.html
