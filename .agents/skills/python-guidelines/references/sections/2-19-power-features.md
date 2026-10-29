<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#power-features. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="s2.19-power-features"></a>
<a id="219-power-features"></a>

<a id="power-features"></a>

### 2.19 Power Features

Avoid these features.

<a id="s2.19.1-definition"></a>
<a id="2191-definition"></a>

<a id="power-features-definition"></a>

#### 2.19.1 Definition

Python is an extremely flexible language and gives you many fancy features such
as custom metaclasses, access to bytecode, on-the-fly compilation, dynamic
inheritance, object reparenting, import hacks, reflection (e.g. some uses of
`getattr()`), modification of system internals, `__del__` methods implementing
customized cleanup, etc.

<a id="s2.19.2-pros"></a>
<a id="2192-pros"></a>

<a id="power-features-pros"></a>

#### 2.19.2 Pros

These are powerful language features. They can make your code more compact.

<a id="s2.19.3-cons"></a>
<a id="2193-cons"></a>

<a id="power-features-cons"></a>

#### 2.19.3 Cons

It's very tempting to use these "cool" features when they're not absolutely
necessary. It's harder to read, understand, and debug code that's using unusual
features underneath. It doesn't seem that way at first (to the original author),
but when revisiting the code, it tends to be more difficult than code that is
longer but is straightforward.

<a id="s2.19.4-decision"></a>
<a id="2194-decision"></a>

<a id="power-features-decision"></a>

#### 2.19.4 Decision

Avoid these features in your code.

Standard library modules and classes that internally use these features are okay
to use (for example, `abc.ABCMeta`, `dataclasses`, and `enum`).
