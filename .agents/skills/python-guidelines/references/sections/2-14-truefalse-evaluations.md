<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#truefalse-evaluations. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="s2.14-truefalse-evaluations"></a>
<a id="214-truefalse-evaluations"></a>

<a id="truefalse-evaluations"></a>

### 2.14 True/False Evaluations

Use the "implicit" false if at all possible (with a few caveats).

<a id="s2.14.1-definition"></a>
<a id="2141-definition"></a>

<a id="truefalse-evaluations-definition"></a>

#### 2.14.1 Definition

Python evaluates certain values as `False` when in a boolean context. A quick
"rule of thumb" is that all "empty" values are considered false, so
`0, None, [], {}, ''` all evaluate as false in a boolean context.

<a id="s2.14.2-pros"></a>
<a id="2142-pros"></a>

<a id="truefalse-evaluations-pros"></a>

#### 2.14.2 Pros

Conditions using Python booleans are easier to read and less error-prone. In
most cases, they're also faster.

<a id="s2.14.3-cons"></a>
<a id="2143-cons"></a>

<a id="truefalse-evaluations-cons"></a>

#### 2.14.3 Cons

May look strange to C/C++ developers.

<a id="s2.14.4-decision"></a>
<a id="2144-decision"></a>

<a id="truefalse-evaluations-decision"></a>

#### 2.14.4 Decision

Use the "implicit" false if possible, e.g., `if foo:` rather than
`if foo != []:`. There are a few caveats that you should keep in mind though:

-   Always use `if foo is None:` (or `is not None`) to check for a `None` value.
    E.g., when testing whether a variable or argument that defaults to `None`
    was set to some other value. The other value might be a value that's false
    in a boolean context!

-   Never compare a boolean variable to `False` using `==`. Use `if not x:`
    instead. If you need to distinguish `False` from `None` then chain the
    expressions, such as `if not x and x is not None:`.

-   For sequences (strings, lists, tuples), use the fact that empty sequences
    are false, so `if seq:` and `if not seq:` are preferable to `if len(seq):`
    and `if not len(seq):` respectively.

-   When handling integers, implicit false may involve more risk than benefit
    (i.e., accidentally handling `None` as 0). You may compare a value which is
    known to be an integer (and is not the result of `len()`) against the
    integer 0.

    <div class='goodcode'></div>

    ```python
    Yes: if not users:
             print('no users')

         if i % 10 == 0:
             self.handle_multiple_of_ten()

         def f(x=None):
             if x is None:
                 x = []
    ```

    <div class='badcode'></div>

    ```python
    No:  if len(users) == 0:
             print('no users')

         if not i % 10:
             self.handle_multiple_of_ten()

         def f(x=None):
             x = x or []
    ```

-   Note that `'0'` (i.e., `0` as string) evaluates to true.

-   Note that Numpy arrays may raise an exception in an implicit boolean
    context. Prefer the `.size` attribute when testing emptiness of a `np.array`
    (e.g. `if not users.size`).
