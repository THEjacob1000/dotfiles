# Profiling

When optimizing a program, you also need a way to determine which parts of the
program are "hot" (executed frequently enough to affect runtime) and worth
modifying. This is best done via profiling.

## Profilers

There are many different profilers available, each with their strengths and
weaknesses. The following is an incomplete list of profilers that have been
used successfully on Rust programs.
- [perf] is a general-purpose profiler that uses hardware performance counters.
  [Hotspot] and [Firefox Profiler] are good for viewing data recorded by perf.
  It works on Linux.
- [Instruments] is a general-purpose profiler that comes with Xcode on macOS.
- [Intel VTune Profiler] is a general-purpose profiler for Windows and Linux.
- [Superluminal] is a sampling profiler with Rust symbol support on Windows
  and Linux (beta).
- [AMD μProf] is a general-purpose profiler for Windows, Linux, and FreeBSD.
- [samply] is a sampling profiler that produces profiles that can be viewed
  in the Firefox Profiler. It works on macOS, Linux, and Windows.
- [cargo-flamegraph] profiles Cargo projects using perf on Linux, xctrace on
  macOS, or native sampling on Windows, and produces a flame graph.
- [Cachegrind] & [Callgrind] give global, per-function, and per-source-line
  instruction counts and simulated cache and branch prediction data. They work
  on Linux and some other Unixes.
- [DHAT] is good for finding which parts of the code are causing a lot of
  allocations, and for giving insight into peak memory usage. It can also be
  used to identify hot calls to `memcpy`. It works on Linux and some other
  Unixes. [dhat-rs] is an experimental alternative that is a little less
  powerful and requires minor changes to your Rust program, but works on all
  platforms.
- [heaptrack] and [bytehound] are heap profiling tools. They work on Linux.
- [Tracy] supports instrumented profiling via the [`tracy-client`] and
  [`tracing-tracy`] crates.
- [`counts`] supports ad hoc profiling, which combines the use of `eprintln!`
  statement with frequency-based post-processing, which is good for getting
  domain-specific insights into parts of your code. It works on all platforms.
- [Coz] performs *causal profiling* to measure optimization potential, and has
  Rust support via [coz-rs]. It works on Linux and macOS.

[perf]: https://perfwiki.github.io/
[Hotspot]: https://github.com/KDAB/hotspot
[Firefox Profiler]: https://profiler.firefox.com/
[Instruments]: https://developer.apple.com/forums/tags/instruments
[Intel VTune Profiler]: https://www.intel.com/content/www/us/en/developer/tools/oneapi/vtune-profiler.html
[AMD μProf]: https://www.amd.com/en/developer/uprof.html
[samply]: https://github.com/mstange/samply/
[cargo-flamegraph]: https://github.com/flamegraph-rs/flamegraph
[Cachegrind]: https://www.valgrind.org/docs/manual/cg-manual.html
[Callgrind]: https://www.valgrind.org/docs/manual/cl-manual.html
[DHAT]: https://www.valgrind.org/docs/manual/dh-manual.html
[dhat-rs]: https://github.com/nnethercote/dhat-rs/
[heaptrack]: https://github.com/KDE/heaptrack
[bytehound]: https://github.com/koute/bytehound
[Tracy]: https://github.com/wolfpld/tracy
[Superluminal]: https://superluminal.eu/applications/rust/
[`tracy-client`]: https://github.com/nagisa/rust_tracy_client
[`tracing-tracy`]: https://github.com/nagisa/rust_tracy_client/tree/master/tracing-tracy
[`counts`]: https://github.com/nnethercote/counts/
[Coz]: https://github.com/plasma-umass/coz
[coz-rs]: https://github.com/plasma-umass/coz/tree/master/rust

## Debug Info

To profile a release build effectively you might need to enable source line
debug info. To do this, add the following lines to your `Cargo.toml` file:
```toml
[profile.release]
debug = "line-tables-only"
```
See the [Cargo documentation] for more details about the `debug` setting.

[Cargo documentation]: https://doc.rust-lang.org/cargo/reference/profiles.html#debug

The distributed standard library may not have the debug info you need. For
source-level profiling within it, nightly Cargo can rebuild it with [`-Z build-std`];
install the matching `rust-src` component first and specify a target:
```bash
rustup component add rust-src --toolchain nightly
cargo +nightly build --release --target x86_64-unknown-linux-gnu -Z build-std
```
Pass `-Z build-std` on subsequent Cargo invocations too. For full variable and
type information, use `debug = "full"` instead of `"line-tables-only"`.

[`-Z build-std`]: https://doc.rust-lang.org/cargo/reference/unstable.html#build-std

Nightly-only `-Z annotate-moves` emits debug information for compiler-generated
moves and copies, making them visible to profilers.

## Frame pointers

The Rust compiler may optimize away frame pointers, which can hurt the quality
of profiling information such as stack traces. To force the compiler to use
frame pointers, use the `-C force-frame-pointers=yes` flag. For example:
```bash
RUSTFLAGS="-C force-frame-pointers=yes" cargo build --release
```

Alternatively, to force frame pointers from a [`config.toml`] file (for one
or more projects), add these lines:
```toml
[build]
rustflags = ["-C", "force-frame-pointers=yes"]
```
[`config.toml`]: https://doc.rust-lang.org/cargo/reference/config.html

## Symbol Demangling

Rust's default symbol mangling format is v0. Profilers with v0 demangling
support display readable names; otherwise, symbols beginning with `_R` can be
demangled with [`rustfilt`]. The older legacy format produces `_ZN` names.

[`rustfilt`]: https://crates.io/crates/rustfilt
