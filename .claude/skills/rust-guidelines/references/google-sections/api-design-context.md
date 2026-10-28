Google Rust Style Guide excerpt: `api-design-context`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="api-design-context"></a>

## Apply API design rules in context

When applying rules that relate to API design, you should distinguish two types
of code:

*   Library code

    *   Intended for use by other projects (applications or other libraries).
    *   Solves a relatively general problem.

*   Application code

    *   Intended for use in a single application.
    *   Solves a more specific problem.

For *library code*, style guide rules that concern API design are binding.

For *application code*, the rules on API design are a strong recommendation. As
you apply them, keep in mind that since application code is written to solve a
specific problem, it should generally favor simplicity and directness over broad
reusability. Avoid premature generalization and abstraction; focus on what is
required to meet the immediate need.
