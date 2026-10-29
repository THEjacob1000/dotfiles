<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#typed-code. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="s2.21-type-annotated-code"></a>
<a id="s2.21-typed-code"></a>
<a id="221-type-annotated-code"></a>
<a id="typed-code"></a>

<a id="typed-code"></a>

### 2.21 Type Annotated Code

You can annotate Python code with
[type hints](https://docs.python.org/3/library/typing.html). Type-check the code
at build time with a type checking tool like [pyrefly](https://pyrefly.org/). In
most cases, when feasible, type annotations are in source files. For third-party
or extension modules, annotations can be in
[stub `.pyi` files](https://peps.python.org/pep-0484/#stub-files).

<a id="s2.21.1-definition"></a>
<a id="2211-definition"></a>

<a id="typed-code-definition"></a>

#### 2.21.1 Definition

Type annotations (or "type hints") are for function or method arguments and
return values:

<div class='goodcode'></div>

```python
def func(a: int) -> list[int]:
```

You can also declare the type of a variable using similar syntax:

<div class='goodcode'></div>

```python
a: SomeType = some_func()
```

<a id="s2.21.2-pros"></a>
<a id="2212-pros"></a>

<a id="typed-code-pros"></a>

#### 2.21.2 Pros

Type annotations improve the readability and maintainability of your code. The
type checker will convert many runtime errors to build-time errors, and reduce
your ability to use [Power Features](https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#power-features).

<a id="s2.21.3-cons"></a>
<a id="2213-cons"></a>

<a id="typed-code-cons"></a>

#### 2.21.3 Cons

You will have to keep the type declarations up to date. You might see type
errors that you think are valid code. Use of a type checker may reduce your
ability to use [Power Features](https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#power-features).

<a id="s2.21.4-decision"></a>
<a id="2214-decision"></a>

<a id="typed-code-decision"></a>

#### 2.21.4 Decision

You are strongly encouraged to enable Python type analysis when updating code.
When adding or modifying public APIs, include type annotations and enable
type-checking in the build system. As static analysis is relatively new to
Python, we acknowledge that undesired side-effects (such as wrongly inferred
types) may prevent adoption by some projects. In those situations, authors are
encouraged to add a comment with a TODO or link to a bug describing the issue(s)
currently preventing type annotation adoption in the BUILD file or in the code
itself as appropriate.
