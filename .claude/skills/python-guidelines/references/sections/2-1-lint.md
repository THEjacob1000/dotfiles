<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#lint. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="s2.1-lint"></a>
<a id="21-lint"></a>

<a id="lint"></a>

### 2.1 Lint

Run `pylint` over your code using this
[pylintrc](https://google.github.io/styleguide/pylintrc).

<a id="s2.1.1-definition"></a>
<a id="211-definition"></a>

<a id="lint-definition"></a>

#### 2.1.1 Definition

`pylint` is a tool for finding bugs and style problems in Python source code. It
finds problems that are typically caught by a compiler for less dynamic
languages like C and C++. Because of the dynamic nature of Python, some warnings
may be incorrect; however, spurious warnings should be fairly infrequent.

<a id="s2.1.2-pros"></a>
<a id="212-pros"></a>

<a id="lint-pros"></a>

#### 2.1.2 Pros

Catches easy-to-miss errors like typos, using-vars-before-assignment, etc.

<a id="s2.1.3-cons"></a>
<a id="213-cons"></a>

<a id="lint-cons"></a>

#### 2.1.3 Cons

`pylint` isn't perfect. To take advantage of it, sometimes we'll need to write
around it, suppress its warnings or fix it.

<a id="s2.1.4-decision"></a>
<a id="214-decision"></a>

<a id="lint-decision"></a>

#### 2.1.4 Decision

Make sure you run `pylint` on your code.

Suppress warnings if they are inappropriate so that other issues are not hidden.
To suppress warnings, you can set a line-level comment:

<div class='goodcode'></div>

```python
def do_PUT(self):  # WSGI name, so pylint: disable=invalid-name
  ...
```

`pylint` warnings are each identified by symbolic name (`empty-docstring`)
Google-specific warnings start with `g-`.

If the reason for the suppression is not clear from the symbolic name, add an
explanation.

Suppressing in this way has the advantage that we can easily search for
suppressions and revisit them.

You can get a list of `pylint` warnings by doing:

```shell
pylint --list-msgs
```

To get more information on a particular message, use:

```shell
pylint --help-msg=invalid-name
```

Prefer `pylint: disable` to the deprecated older form `pylint: disable-msg`.

Unused argument warnings can be suppressed by deleting the variables at the
beginning of the function. Always include a comment explaining why you are
deleting it. "Unused." is sufficient. For example:

<div class='goodcode'></div>

```python
def viking_cafe_order(spam: str, beans: str, eggs: str | None = None) -> str:
    del beans, eggs  # Unused by vikings.
    return spam + spam + spam
```

Other common forms of suppressing this warning include using '`_`' as the
identifier for the unused argument or prefixing the argument name with
'`unused_`', or assigning them to '`_`'. These forms are allowed but no longer
encouraged. These break callers that pass arguments by name and do not enforce
that the arguments are actually unused.
