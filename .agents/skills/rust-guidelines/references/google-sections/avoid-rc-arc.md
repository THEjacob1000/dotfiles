Google Rust Style Guide excerpt: `avoid-rc-arc`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="avoid-rc-arc"></a>

### Avoid `Rc` and `Arc`

Prefer unique ownership and borrowing over `Rc` and `Arc` for managing memory.

Exception:

*   Use `Rc` and `Arc` when the alternative ownership and borrowing structure
    would be unreasonably complex to write, understand, or maintain. This is a
    judgment call to be discussed during code review.

Rationale

Generally, Rust allows representing object graphs without using shared ownership
smart pointers. These pointers add runtime overhead and their own unique
complexity. Engineers coming from other languages might tend to use `Rc` and
`Arc` too quickly.
