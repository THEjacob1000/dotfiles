<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#consistency. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="4-parting-words"></a>

<a id="consistency"></a>

## 4 Parting Words

*BE CONSISTENT*.

If you're editing code, take a few minutes to look at the code around you and
determine its style. If they use `_idx` suffixes in index variable names, you
should too. If their comments have little boxes of hash marks around them, make
your comments have little boxes of hash marks around them too.

The point of having style guidelines is to have a common vocabulary of coding so
people can concentrate on what you're saying rather than on how you're saying
it. We present global style rules here so people know the vocabulary, but local
style is also important. If code you add to a file looks drastically different
from the existing code around it, it throws readers out of their rhythm when
they go to read it.

However, there are limits to consistency. It applies more heavily locally and on
choices unspecified by the global style. Consistency should not generally be
used as a justification to do things in an old style without considering the
benefits of the new style, or the tendency of the codebase to converge on newer
styles over time.
