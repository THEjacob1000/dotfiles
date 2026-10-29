<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#getters-and-setters. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="s3.15-accessors"></a>
<a id="s3.15-access-control"></a>
<a id="315-access-control"></a>
<a id="access-control"></a>
<a id="accessors"></a>

<a id="getters-and-setters"></a>

### 3.15 Getters and Setters

Getter and setter functions (also called accessors and mutators) should be used
when they provide a meaningful role or behavior for getting or setting a
variable's value.

In particular, they should be used when getting or setting the variable is
complex or the cost is significant, either currently or in a reasonable future.

If, for example, a pair of getters/setters simply read and write an internal
attribute, the internal attribute should be made public instead. By comparison,
if setting a variable means some state is invalidated or rebuilt, it should be a
setter function. The function invocation hints that a potentially non-trivial
operation is occurring. Alternatively, [properties](https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#properties) may be an
option when simple logic is needed, or refactoring to no longer need getters and
setters.

Getters and setters should follow the [Naming](https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#s3.16-naming) guidelines, such
as `get_foo()` and `set_foo()`.

If the past behavior allowed access through a property, do not bind the new
getter/setter functions to the property. Any code still attempting to access the
variable by the old method should break visibly so they are made aware of the
change in complexity.
