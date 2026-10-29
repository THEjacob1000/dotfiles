<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#naming. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="s3.16-naming"></a>
<a id="316-naming"></a>

<a id="naming"></a>

### 3.16 Naming

`module_name`, `package_name`, `ClassName`, `method_name`, `ExceptionName`,
`function_name`, `GLOBAL_CONSTANT_NAME`, `global_var_name`, `instance_var_name`,
`function_parameter_name`, `local_var_name`, `query_proper_noun_for_thing`,
`send_acronym_via_https`.

Names should be descriptive. This includes functions, classes, variables,
attributes, files and any other type of named entities.

Avoid abbreviation. In particular, do not use abbreviations that are ambiguous
or unfamiliar to readers outside your project, and do not abbreviate by deleting
letters within a word.

Always use a `.py` filename extension. Never use dashes.

<a id="s3.16.1-names-to-avoid"></a>
<a id="3161-names-to-avoid"></a>

<a id="names-to-avoid"></a>

#### 3.16.1 Names to Avoid

-   single character names, except for specifically allowed cases:

    -   counters or iterators (e.g. `i`, `j`, `k`, `v`, et al.)
    -   `e` as an exception identifier in `try/except` statements.
    -   `f` as a file handle in `with` statements
    -   private [type variables](https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#typing-type-var) with no constraints (e.g.
        `_T = TypeVar("_T")`, `_P = ParamSpec("_P")`)
    -   names that match established notation in a reference paper or algorithm
        (see [Mathematical Notation](https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#math-notation))

    Please be mindful not to abuse single-character naming. Generally speaking,
    descriptiveness should be proportional to the name's scope of visibility.
    For example, `i` might be a fine name for 5-line code block but within
    multiple nested scopes, it is likely too vague.

-   dashes (`-`) in any package/module name

-   `__double_leading_and_trailing_underscore__` names (reserved by Python)

-   offensive terms

-   names that needlessly include the type of the variable (for example:
    `id_to_name_dict`)

<a id="s3.16.2-naming-conventions"></a>
<a id="3162-naming-convention"></a>

<a id="naming-conventions"></a>

#### 3.16.2 Naming Conventions

-   In general, follow [PEP 8 naming conventions][PEP-8-naming-conventions].

-   "Internal" means internal to a module, or protected or private within a
    class.

-   Prepending a single underscore (`_`) has some support for protecting module
    variables and functions (linters will flag protected member access). Note
    that it is okay for unit tests to access protected constants from the
    modules under test.

-   Prepending a double underscore (`__` aka "dunder") to an instance variable
    or method effectively makes the variable or method private to its class
    (using name mangling); we discourage its use as it impacts readability and
    testability, and isn't *really* private. Prefer a single underscore.

-   Place related classes and top-level functions together in a module. Unlike
    Java, there is no need to limit yourself to one class per module.

-   Use CapWords for class names, but lower\_with\_under.py for module names.
    Although there are some old modules named CapWords.py, this is now
    discouraged because it's confusing when the module happens to be named after
    a class. ("wait -- did I write `import StringIO` or
    `from StringIO import StringIO`?")

    -   Note that [PEP 8 says][PEP-8-acronyms]: "When using acronyms in
        CapWords, capitalize all the letters of the acronym. Thus
        HTTPServerError is better than HttpServerError."

-   New *unit test* files follow PEP 8 compliant lower\_with\_under method
    names, for example, `test_<method_under_test>_<state>`. For consistency(\*)
    with legacy modules that follow CapWords function names, underscores may
    appear in method names starting with `test` to separate logical components
    of the name. One possible pattern is `test<MethodUnderTest>_<state>`.

[PEP-8-naming-conventions]: https://peps.python.org/pep-0008/#naming-conventions
[PEP-8-acronyms]: https://peps.python.org/pep-0008/#descriptive-naming-styles

<a id="naming-exemptions"></a>

##### 3.16.2.1 Exemptions

The following exemptions apply to the general naming conventions above:

-   When Python code is tightly coupled with an external or non-Python codebase,
    such as foreign function interfaces (FFIs) to C++, consistency with the
    other codebase may warrant following a different convention
    ([Consistency](https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#consistency)).

<a id="s3.16.3-file-naming"></a>
<a id="3163-file-naming"></a>

<a id="file-naming"></a>

#### 3.16.3 File Naming

Python filenames must have a `.py` extension and must not contain dashes (`-`).
This allows them to be imported and unittested. If you want an executable to be
accessible without the extension, use a symbolic link or a simple bash wrapper
containing `exec "$0.py" "$@"`.

<a id="s3.16.4-guidelines-derived-from-guidos-recommendations"></a>
<a id="3164-guidelines-derived-from-guidos-recommendations"></a>

<a id="guidelines-derived-from-guidos-recommendations"></a>

#### 3.16.4 Guidelines derived from [Guido](https://en.wikipedia.org/wiki/Guido_van_Rossum)'s Recommendations

<table rules="all" border="1" summary="Guidelines from Guido's Recommendations"
       cellspacing="2" cellpadding="2">

  <tr>
    <th>Type</th>
    <th>Public</th>
    <th>Internal</th>
  </tr>

  <tr>
    <td>Packages</td>
    <td><code>lower_with_under</code></td>
    <td></td>
  </tr>

  <tr>
    <td>Modules</td>
    <td><code>lower_with_under</code></td>
    <td><code>_lower_with_under</code></td>
  </tr>

  <tr>
    <td>Classes</td>
    <td><code>CapWords</code></td>
    <td><code>_CapWords</code></td>
  </tr>

  <tr>
    <td>Exceptions</td>
    <td><code>CapWords</code></td>
    <td></td>
  </tr>

  <tr>
    <td>Functions</td>
    <td><code>lower_with_under()</code></td>
    <td><code>_lower_with_under()</code></td>
  </tr>

  <tr>
    <td>Global/Class Constants</td>
    <td><code>CAPS_WITH_UNDER</code></td>
    <td><code>_CAPS_WITH_UNDER</code></td>
  </tr>

  <tr>
    <td>Global/Class Variables</td>
    <td><code>lower_with_under</code></td>
    <td><code>_lower_with_under</code></td>
  </tr>

  <tr>
    <td>Instance Variables</td>
    <td><code>lower_with_under</code></td>
    <td><code>_lower_with_under</code> (protected)</td>
  </tr>

  <tr>
    <td>Method Names</td>
    <td><code>lower_with_under()</code></td>
    <td><code>_lower_with_under()</code> (protected)</td>
  </tr>

  <tr>
    <td>Function/Method Parameters</td>
    <td><code>lower_with_under</code></td>
    <td></td>
  </tr>

  <tr>
    <td>Local Variables</td>
    <td><code>lower_with_under</code></td>
    <td></td>
  </tr>

</table>

<a id="s3.17-main"></a>
<a id="317-main"></a>

<a id="math-notation"></a>

#### 3.16.5 Mathematical Notation

For mathematically-heavy code, short variable names that would otherwise violate
the style guide are preferred when they match established notation in a
reference paper or algorithm.

When using names based on established notation:

1.  Cite the source of all naming conventions, preferably with a hyperlink to
    academic resource itself, in a comment or docstring. If the source is not
    accessible, clearly document the naming conventions.
2.  Prefer PEP 8-compliant `descriptive_names` for public APIs, which are much
    more likely to be encountered out of context.
3.  Use a narrowly-scoped `pylint: disable=invalid-name` directive to silence
    warnings. For just a few variables, use the directive as an endline comment
    for each one; for more, apply the directive at the beginning of a block.
