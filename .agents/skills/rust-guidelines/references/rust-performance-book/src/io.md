# I/O

## Locking

Rust's [`print!`] and [`println!`] macros lock stdout on every call. If you
have repeated calls to these macros it may be better to lock stdout manually.

[`print!`]: https://doc.rust-lang.org/std/macro.print.html
[`println!`]: https://doc.rust-lang.org/std/macro.println.html

For example, change this code:
```rust
# let lines = vec!["one", "two", "three"];
for line in lines {
    println!("{}", line);
}
```
to this:
```rust
# fn blah() -> Result<(), std::io::Error> {
# let lines = vec!["one", "two", "three"];
use std::io::Write;
let stdout = std::io::stdout();
let mut lock = stdout.lock();
for line in lines {
    writeln!(lock, "{}", line)?;
}
// stdout is unlocked when `lock` is dropped
# Ok(())
# }
```
stdin and stderr can likewise be locked when doing repeated operations on them.

## Buffering

File I/O is unbuffered by default. If you make many small reads or writes to
a file or network socket, use [`BufReader`] or [`BufWriter`] to reduce the
number of system calls.

[`BufReader`]: https://doc.rust-lang.org/std/io/struct.BufReader.html
[`BufWriter`]: https://doc.rust-lang.org/std/io/struct.BufWriter.html

For example, change this unbuffered writer code:
```rust
# fn blah() -> Result<(), std::io::Error> {
# let lines = vec!["one", "two", "three"];
use std::io::Write;
let mut out = std::fs::File::create("test.txt")?;
for line in lines {
    writeln!(out, "{}", line)?;
}
# Ok(())
# }
```
to this:
```rust
# fn blah() -> Result<(), std::io::Error> {
# let lines = vec!["one", "two", "three"];
use std::io::{BufWriter, Write};
let mut out = BufWriter::new(std::fs::File::create("test.txt")?);
for line in lines {
    writeln!(out, "{}", line)?;
}
out.flush()?;
# Ok(())
# }
```
[**Example 1**](https://github.com/rust-lang/rust/pull/93954),
[**Example 2**](https://github.com/nnethercote/dhat-rs/pull/22/commits/8c3ae26f1219474ee55c30bc9981e6af2e869be2).

Dropping a [`BufWriter`] attempts to flush buffered data but ignores any error.
Flush explicitly to handle errors before returning.

[`flush`]: https://doc.rust-lang.org/std/io/trait.Write.html#tymethod.flush

Forgetting to buffer is more common when writing: both buffered and unbuffered
writers implement [`Write`], so their call sites look similar. Buffered
readers implement both [`Read`] and [`BufRead`]; the latter adds convenient
methods such as [`BufRead::read_line`] and [`BufRead::lines`].

[`Write`]: https://doc.rust-lang.org/std/io/trait.Write.html
[`Read`]: https://doc.rust-lang.org/std/io/trait.Read.html
[`BufRead`]: https://doc.rust-lang.org/std/io/trait.BufRead.html
[`BufRead::read_line`]: https://doc.rust-lang.org/std/io/trait.BufRead.html#method.read_line
[`BufRead::lines`]: https://doc.rust-lang.org/std/io/trait.BufRead.html#method.lines

Stdout already has a shared buffer, line-buffered when connected to a terminal.
For repeated writes, lock it once; a separate [`BufWriter`] may help when many
small writes would otherwise be flushed individually (such as lines on a
terminal). Flush explicitly when prompt output must appear immediately.

## Reading Lines from a File

[This section] explains how to avoid excessive allocations when using
[`BufRead`] to read a file one line at a time.

[This section]: heap-allocations.md#reading-lines-from-a-file
[`BufRead`]: https://doc.rust-lang.org/std/io/trait.BufRead.html

## Reading Input as Raw Bytes

The built-in [String] type uses UTF-8 internally, which adds a small, but
nonzero overhead caused by UTF-8 validation when you read input into it. If you
just want to process input bytes without worrying about UTF-8 (for example if
you handle ASCII text), you can use [`BufRead::read_until`].

[String]: https://doc.rust-lang.org/std/string/struct.String.html
[`BufRead::read_until`]: https://doc.rust-lang.org/std/io/trait.BufRead.html#method.read_until

The [`bstr`] crate provides tools for working with byte strings, including
byte-oriented lines.

[`bstr`]: https://github.com/BurntSushi/bstr
