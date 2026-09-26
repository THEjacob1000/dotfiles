# Machine Code

When you have a small piece of very hot code it may be worth inspecting the
generated assembly to look for inefficiencies, such as removable [bounds
checks]. [Compiler Explorer] is useful for small snippets; [`cargo-show-asm`]
shows individual functions in full Cargo projects. [`rustc --emit`] can
generate assembly (`--emit=asm`) or LLVM IR (`--emit=llvm-ir`).

[bounds checks]: bounds-checks.md
[Compiler Explorer]: https://godbolt.org/
[`cargo-show-asm`]: https://github.com/pacak/cargo-show-asm
[`rustc --emit`]: https://doc.rust-lang.org/rustc/command-line-arguments.html#--emit-specifies-the-types-of-output-files-to-generate

The [`core::arch`] module provides architecture-specific intrinsics, including
SIMD operations. Portable SIMD is available on nightly with
`#![feature(portable_simd)]` through [`std::simd`].

[`core::arch`]: https://doc.rust-lang.org/core/arch/index.html
[`std::simd`]: https://doc.rust-lang.org/std/simd/index.html
