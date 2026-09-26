# Upstream sources

Read the relevant baseline alongside Microsoft's topic rules. Microsoft adds guidance and overrides explicit design choices; it does not replace these sources. Local invariant policy and repository constraints take precedence; language safety requirements still apply.

- API design and known `C-*` IDs: [checklist](../rust-api-guidelines/src/checklist.md). Find the ID's reference definition, then read that local chapter and section. [Contents](../rust-api-guidelines/src/SUMMARY.md) lists every chapter.
- Formatting and syntax layout: [Style Guide contents](../rust-style-guide/src/doc/style-guide/src/SUMMARY.md). Use the repository's rustfmt configuration; consult the relevant chapter for choices formatting does not settle.
- Idioms, patterns, and anti-patterns: [Design Patterns contents](../rust-design-patterns/src/SUMMARY.md). Select the specific idiom or pattern relevant to the design; the catalogue does not require introducing a pattern.
- Performance: [Performance Book contents](../rust-performance-book/src/SUMMARY.md), maintained here for the pinned nightly. Read the chapter for the cost at hand; measure first.
- Unsafe and soundness: [undefined behavior](../rust-reference/src/behavior-considered-undefined.md), [behavior not considered unsafe](../rust-reference/src/behavior-not-considered-unsafe.md), [unsafety](../rust-reference/src/unsafety.md), and [unsafe keyword](../rust-reference/src/unsafe-keyword.md). The Reference explicitly does not give a complete formal model of Rust's unsafe semantics.

## Resolve upstream links locally

Vendored text stays byte-for-byte upstream. Resolve relative links from the source file; replace `.html` with `.md` and use the fragment or rule ID to find the section. For website links:

- `rust-lang.github.io/api-guidelines/` maps to `references/rust-api-guidelines/src/`.
- `doc.rust-lang.org/{nightly,stable}/style-guide/` and `doc.rust-lang.org/style-guide/` map to `references/rust-style-guide/src/doc/style-guide/src/`.
- `rust-unofficial.github.io/patterns/` maps to `references/rust-design-patterns/src/`.
- `doc.rust-lang.org/reference/` maps to the selected `references/rust-reference/src/` chapters.

Reference labels such as `[expr.pointer]` are semantic cross-references, not local filenames. Other Reference chapters, external dependency docs, and images are not vendored; follow the upstream link when needed. Do not interpret an omitted target as absence of a rule.

## Provenance

Each manifest records the revision, selection, license, and hashes. License files sit beside it. Read these only when auditing or updating:

- [Microsoft](../microsoft/upstream.json)
- [Rust API Guidelines](../rust-api-guidelines/upstream.json)
- [Style Guide](../rust-style-guide/upstream.json)
- [Design Patterns](../rust-design-patterns/upstream.json)
- [Reference](../rust-reference/upstream.json)
