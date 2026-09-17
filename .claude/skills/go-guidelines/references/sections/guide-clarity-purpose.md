<a id="principles"></a>

## Style principles

There are a few overarching principles that summarize how to think about writing
readable Go code. The following are attributes of readable code, in order of
importance:

1.  **[Clarity]**: The code's purpose and rationale is clear to the reader.
1.  **[Simplicity]**: The code accomplishes its goal in the simplest way
    possible.
1.  **[Concision]**: The code has a high signal-to-noise ratio.
1.  **[Maintainability]**: The code is written such that it can be easily
    maintained.
1.  **[Consistency]**: The code is consistent with the broader Google codebase.

[Clarity]: https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#clarity
[Simplicity]: https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#simplicity
[Concision]: https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#concision
[Maintainability]: https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#maintainability
[Consistency]: https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#consistency

<a id="clarity"></a>

### Clarity

The core goal of readability is to produce code that is clear to the reader.

Clarity is primarily achieved with effective naming, helpful commentary, and
efficient code organization.

Clarity is to be viewed through the lens of the reader, not the author of the
code. It is more important that code be easy to read than easy to write. Clarity
in code has two distinct facets:

*   [What is the code actually doing?](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#clarity-purpose)
*   [Why is the code doing what it does?](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#clarity-rationale)

<a id="clarity-purpose"></a>

#### What is the code actually doing?

Go is designed such that it should be relatively straightforward to see what the
code is doing. In cases of uncertainty or where a reader may require prior
knowledge in order to understand the code, it is worth investing time in order
to make the code's purpose clearer for future readers. For example, it may help
to:

*   Use more descriptive variable names
*   Add additional commentary
*   Break up the code with whitespace and comments
*   Refactor the code into separate functions/methods to make it more modular

There is no one-size-fits-all approach here, but it is important to prioritize
clarity when developing Go code.

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#clarity-purpose. Locally segmented; local links rewritten to this pinned revision. -->
