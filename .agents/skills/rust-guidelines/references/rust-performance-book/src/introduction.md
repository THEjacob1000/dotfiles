# Introduction

Performance matters for many Rust programs. These techniques address runtime
speed, memory usage, binary size, and [compile times]. Some require only build
configuration changes; others require code changes.

[compile times]: compile-times.md

Some techniques are Rust-specific; others apply to programs in other
languages, often with modifications. [General Tips] covers broader
principles. This reference is no substitute for a general guide to
profiling and optimisation.

[General Tips]: general-tips.md

The emphasis is on practical techniques, with links to real-world Rust
changes and further reading. The examples lean towards compiler development
and do not cover every area, such as scientific computing, equally.

The chapters favour breadth over depth and are aimed at intermediate and
advanced Rust users.
