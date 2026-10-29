<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#lexical-scoping. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="s2.16-lexical-scoping"></a>
<a id="216-lexical-scoping"></a>

<a id="lexical-scoping"></a>

### 2.16 Lexical Scoping

Okay to use.

<a id="s2.16.1-definition"></a>
<a id="2161-definition"></a>

<a id="lexical-scoping-definition"></a>

#### 2.16.1 Definition

A nested Python function can refer to variables defined in enclosing functions,
but cannot assign to them. Variable bindings are resolved using lexical scoping,
that is, based on the static program text. Any assignment to a name in a block
will cause Python to treat all references to that name as a local variable, even
if the use precedes the assignment. If a global declaration occurs, the name is
treated as a global variable.

An example of the use of this feature is:

<div class='goodcode'></div>

```python
def get_adder(summand1: float) -> Callable[[float], float]:
    """Returns a function that adds numbers to a given number."""
    def adder(summand2: float) -> float:
        return summand1 + summand2

    return adder
```

<a id="s2.16.2-pros"></a>
<a id="2162-pros"></a>

<a id="lexical-scoping-pros"></a>

#### 2.16.2 Pros

Often results in clearer, more elegant code. Especially comforting to
experienced Lisp and Scheme (and Haskell and ML and ...) programmers.

<a id="s2.16.3-cons"></a>
<a id="2163-cons"></a>

<a id="lexical-scoping-cons"></a>

#### 2.16.3 Cons

Can lead to confusing bugs, such as this example based on
[PEP-0227](https://peps.python.org/pep-0227/):

<div class='badcode'></div>

```python
i = 4
def foo(x: Iterable[int]):
    def bar():
        print(i, end='')
    # ...
    # A bunch of code here
    # ...
    for i in x:  # Ah, i *is* local to foo, so this is what bar sees
        print(i, end='')
    bar()
```

So `foo([1, 2, 3])` will print `1 2 3 3`, not `1 2 3 4`.

<a id="s2.16.4-decision"></a>
<a id="2164-decision"></a>

<a id="lexical-scoping-decision"></a>

#### 2.16.4 Decision

Okay to use.
