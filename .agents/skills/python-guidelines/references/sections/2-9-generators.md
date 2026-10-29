<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#generators. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="s2.9-generators"></a>
<a id="29-generators"></a>

<a id="generators"></a>

### 2.9 Generators

Use generators as needed.

<a id="s2.9.1-definition"></a>
<a id="291-definition"></a>

<a id="generators-definition"></a>

#### 2.9.1 Definition

A generator function returns an iterator that yields a value each time it
executes a yield statement. After it yields a value, the runtime state of the
generator function is suspended until the next value is needed.

<a id="s2.9.2-pros"></a>
<a id="292-pros"></a>

<a id="generators-pros"></a>

#### 2.9.2 Pros

Simpler code, because the state of local variables and control flow are
preserved for each call. A generator uses less memory than a function that
creates an entire list of values at once.

<a id="s2.9.3-cons"></a>
<a id="293-cons"></a>

<a id="generators-cons"></a>

#### 2.9.3 Cons

Local variables in the generator will not be garbage collected until the
generator is either consumed to exhaustion or itself garbage collected.

<a id="s2.9.4-decision"></a>
<a id="294-decision"></a>

<a id="generators-decision"></a>

#### 2.9.4 Decision

Fine. Use "Yields:" rather than "Returns:" in the docstring for generator
functions.

If the generator manages an expensive resource, make sure to force the clean up.

A good way to do the clean up is by wrapping the generator with a context
manager [PEP-0533](https://peps.python.org/pep-0533/).
