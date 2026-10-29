<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#imports. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="s2.2-imports"></a>
<a id="22-imports"></a>

<a id="imports"></a>

### 2.2 Imports

Use `import` statements for packages and modules only, not for individual types,
classes, or functions.

<a id="s2.2.1-definition"></a>
<a id="221-definition"></a>

<a id="imports-definition"></a>

#### 2.2.1 Definition

Reusability mechanism for sharing code from one module to another.

<a id="s2.2.2-pros"></a>
<a id="222-pros"></a>

<a id="imports-pros"></a>

#### 2.2.2 Pros

The namespace management convention is simple. The source of each identifier is
indicated in a consistent way; `x.Obj` says that object `Obj` is defined in
module `x`.

<a id="s2.2.3-cons"></a>
<a id="223-cons"></a>

<a id="imports-cons"></a>

#### 2.2.3 Cons

Module names can still collide. Some module names are inconveniently long.

<a id="s2.2.4-decision"></a>
<a id="224-decision"></a>

<a id="imports-decision"></a>

#### 2.2.4 Decision

*   Use `import x` for importing packages and modules.
*   Use `from x import y` where `x` is the package prefix and `y` is the module
    name with no prefix.
*   Use `from x import y as z` in any of the following circumstances:
    -   Two modules named `y` are to be imported.
    -   `y` conflicts with a top-level name defined in the current module.
    -   `y` conflicts with a common parameter name that is part of the public
        API (e.g., `features`).
    -   `y` is an inconveniently long name.
    -   `y` is too generic in the context of your code (e.g.,
        `from storage.file_system import options as fs_options`).
*   Use `import y as z` only when `z` is a standard abbreviation (e.g.,
    `import numpy as np`).

For example the module `sound.effects.echo` may be imported as follows:

<div class='goodcode'></div>

```python
from sound.effects import echo
...
echo.EchoFilter(input, output, delay=0.7, atten=4)
```

Do not use relative names in imports. Even if the module is in the same package,
use the full package name. This helps prevent unintentionally importing a
package twice.

<a id="imports-exemptions"></a>

##### 2.2.4.1 Exemptions

Symbols from the following modules, used to support static analysis and type
checking, are exempt from this rule:

*   [`typing` module](https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#typing-imports)
*   [`collections.abc` module](https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#typing-imports)
*   [`typing_extensions` module](https://github.com/python/typing_extensions/blob/main/README.md)
