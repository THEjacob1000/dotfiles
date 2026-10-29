<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#shebang-line. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="Python_Interpreter"></a>
<a id="s3.7-shebang-line"></a>
<a id="37-shebang-line"></a>

<a id="shebang-line"></a>

### 3.7 Shebang Line

Most `.py` files do not need to start with a `#!` line. Start the main file of a
program with `#!/usr/bin/env python3` (to support virtualenvs) or
`#!/usr/bin/python3` per [PEP-394](https://peps.python.org/pep-0394/).

This line is used by the kernel to find the Python interpreter, but is ignored
by Python when importing modules. It is only necessary on a file intended to be
executed directly.
