<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#modern-python. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="s2.20-modern-python"></a>
<a id="220-modern-python"></a>

<a id="modern-python"></a>

### 2.20 Modern Python: from \_\_future\_\_ imports

New language version semantic changes may be gated behind a special future
import to enable them on a per-file basis within earlier runtimes.

<a id="s2.20.1-definition"></a>
<a id="2201-definition"></a>

<a id="modern-python-definition"></a>

#### 2.20.1 Definition

Being able to turn on some of the more modern features via
`from __future__ import` statements allows early use of features from expected
future Python versions.

<a id="s2.20.2-pros"></a>
<a id="2202-pros"></a>

<a id="modern-python-pros"></a>

#### 2.20.2 Pros

This has proven to make runtime version upgrades smoother as changes can be made
on a per-file basis while declaring compatibility and preventing regressions
within those files. Modern code is more maintainable as it is less likely to
accumulate technical debt that will be problematic during future runtime
upgrades.

<a id="s2.20.3-cons"></a>
<a id="2203-cons"></a>

<a id="modern-python-cons"></a>

#### 2.20.3 Cons

Such code may not work on very old interpreter versions prior to the
introduction of the needed future statement. The need for this is more common in
projects supporting an extremely wide variety of environments.

<a id="s2.20.4-decision"></a>
<a id="2204-decision"></a>

<a id="modern-python-decision"></a>

#### 2.20.4 Decision

##### from \_\_future\_\_ imports

Use of `from __future__ import` statements is encouraged. It allows a given
source file to start using more modern Python syntax features today. Once you no
longer need to run on a version where the features are hidden behind a
`__future__` import, feel free to remove those lines.

In code that may execute on versions as old as 3.5 rather than >= 3.7, import:

<div class='goodcode'></div>

```python
from __future__ import generator_stop
```

For more information read the
[Python future statement definitions](https://docs.python.org/3/library/__future__.html)
documentation.

Please don't remove these imports until you are confident the code is only ever
used in a sufficiently modern environment. Even if you do not currently use the
feature a specific future import enables in your code today, keeping it in place
in the file prevents later modifications of the code from inadvertently
depending on the older behavior.

Use other `from __future__` import statements as you see fit.
