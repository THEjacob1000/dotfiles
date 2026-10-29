<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#nested-classes-functions. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="s2.6-nested"></a>
<a id="26-nested"></a>

<a id="nested-classes-functions"></a>

### 2.6 Nested/Local/Inner Classes and Functions

Nested local functions or classes are fine when used to close over a local
variable. Inner classes are fine.

<a id="s2.6.1-definition"></a>
<a id="261-definition"></a>

<a id="nested-classes-functions-definition"></a>

#### 2.6.1 Definition

A class can be defined inside of a method, function, or class. A function can be
defined inside a method or function. Nested functions have read-only access to
variables defined in enclosing scopes.

<a id="s2.6.2-pros"></a>
<a id="262-pros"></a>

<a id="nested-classes-functions-pros"></a>

#### 2.6.2 Pros

Allows definition of utility classes and functions that are only used inside of
a very limited scope. Very
[ADT](https://en.wikipedia.org/wiki/Abstract_data_type)-y. Commonly used for
implementing decorators.

<a id="s2.6.3-cons"></a>
<a id="263-cons"></a>

<a id="nested-classes-functions-cons"></a>

#### 2.6.3 Cons

Nested functions and classes cannot be directly tested. Nesting can make the
outer function longer and less readable.

<a id="s2.6.4-decision"></a>
<a id="264-decision"></a>

<a id="nested-classes-functions-decision"></a>

#### 2.6.4 Decision

They are fine with some caveats. Avoid nested functions or classes except when
closing over a local value other than `self` or `cls`. Do not nest a function
just to hide it from users of a module. Instead, prefix its name with an \_ at
the module level so that it can still be accessed by tests.
