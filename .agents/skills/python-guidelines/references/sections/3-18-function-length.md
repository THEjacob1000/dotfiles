<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#function-length. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="s3.18-function-length"></a>
<a id="318-function-length"></a>

<a id="function-length"></a>

### 3.18 Function length

Prefer small and focused functions.

We recognize that long functions are sometimes appropriate, so no hard limit is
placed on function length. If a function exceeds about 40 lines, think about
whether it can be broken up without harming the structure of the program.

Even if your long function works perfectly now, someone modifying it in a few
months may add new behavior. This could result in bugs that are hard to find.
Keeping your functions short and simple makes it easier for other people to read
and modify your code.

You could find long and complicated functions when working with some code. Do
not be intimidated by modifying existing code: if working with such a function
proves to be difficult, you find that errors are hard to debug, or you want to
use a piece of it in several different contexts, consider breaking up the
function into smaller and more manageable pieces.
