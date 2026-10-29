<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#imports-formatting. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="s3.13-imports-formatting"></a>
<a id="313-imports-formatting"></a>

<a id="imports-formatting"></a>

### 3.13 Imports formatting

Imports should be on separate lines; there are
[exceptions for `typing` and `collections.abc` imports](https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#typing-imports).

E.g.:

<div class='goodcode'></div>

```python
Yes: from collections.abc import Mapping, Sequence
     import os
     import sys
     from typing import Any, NewType
```

<div class='badcode'></div>

```python
No:  import os, sys
```

Imports are always put at the top of the file, just after any module comments
and docstrings and before module globals and constants. Imports should be
grouped from most generic to least generic:

1.  Python future import statements. For example:

    <div class='goodcode'></div>

    ```python
    from __future__ import annotations
    ```

    See [above](https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#modern-python-decision) for more information about those.

2.  Python standard library imports. For example:

    <div class='goodcode'></div>

    ```python
    import sys
    ```

3.  [third-party](https://pypi.org/) module or package imports. For example:

    <div class='goodcode'></div>

    ```python
    import tensorflow as tf
    ```

4.  Code repository sub-package imports. For example:

    <div class='goodcode'></div>

    ```python
    from otherproject.ai import mind
    ```

5.  **Deprecated:** application-specific imports that are part of the same
    top-level sub-package as this file. For example:

    <div class='goodcode'></div>

    ```python
    from myproject.backend.hgwells import time_machine
    ```

    You may find older Google Python Style code doing this, but it is no longer
    required. **New code is encouraged not to bother with this.** Simply treat
    application-specific sub-package imports the same as other sub-package
    imports.

Within each grouping, imports should be sorted lexicographically, ignoring case,
according to each module's full package path (the `path` in
`from path import ...`). Code may optionally place a blank line between import
sections.

<div class='goodcode'></div>

```python
import collections
import queue
import sys

from absl import app
from absl import flags
import bs4
import cryptography
import tensorflow as tf

from book.genres import scifi
from myproject.backend import huxley
from myproject.backend.hgwells import time_machine
from myproject.backend.state_machine import main_loop
from otherproject.ai import body
from otherproject.ai import mind
from otherproject.ai import soul

# Older style code may have these imports down here instead:
#from myproject.backend.hgwells import time_machine
#from myproject.backend.state_machine import main_loop
```
