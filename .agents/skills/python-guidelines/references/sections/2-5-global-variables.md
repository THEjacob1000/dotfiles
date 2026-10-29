<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#global-variables. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="s2.5-global-variables"></a>
<a id="25-global-variables"></a>
<a id="s2.5-global-state"></a>
<a id="25-global-state"></a>

<a id="global-variables"></a>

### 2.5 Mutable Global State

Avoid mutable global state.

<a id="s2.5.1-definition"></a>
<a id="251-definition"></a>

<a id="global-variables-definition"></a>

#### 2.5.1 Definition

Module-level values or class attributes that can get mutated during program
execution.

<a id="s2.5.2-pros"></a>
<a id="252-pros"></a>

<a id="global-variables-pros"></a>

#### 2.5.2 Pros

Occasionally useful.

<a id="s2.5.3-cons"></a>
<a id="253-cons"></a>

<a id="global-variables-cons"></a>

#### 2.5.3 Cons

*   Breaks encapsulation: Such design can make it hard to achieve valid
    objectives. For example, if global state is used to manage a database
    connection, then connecting to two different databases at the same time
    (such as for computing differences during a migration) becomes difficult.
    Similar problems easily arise with global registries.

*   Has the potential to change module behavior during the import, because
    assignments to global variables are done when the module is first imported.

<a id="s2.5.4-decision"></a>
<a id="254-decision"></a>

<a id="global-variables-decision"></a>

#### 2.5.4 Decision

Avoid mutable global state.

In those rare cases where using global state is warranted, mutable global
entities should be declared at the module level or as a class attribute and made
internal by prepending an `_` to the name. If necessary, external access to
mutable global state must be done through public functions or class methods. See
[Naming](https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#s3.16-naming) below. Please explain the design reasons why mutable
global state is being used in a comment or a doc linked to from a comment.

Module-level constants are permitted and encouraged. For example:
`_MAX_HOLY_HANDGRENADE_COUNT = 3` for an internal use constant or
`SIR_LANCELOTS_FAVORITE_COLOR = "blue"` for a public API constant. Constants
must be named using all caps with underscores. See [Naming](https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#s3.16-naming)
below.
