<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#packages. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="s2.3-packages"></a>
<a id="23-packages"></a>

<a id="packages"></a>

### 2.3 Packages

Import each module using the full pathname location of the module.

<a id="s2.3.1-pros"></a>
<a id="231-pros"></a>

<a id="packages-pros"></a>

#### 2.3.1 Pros

Avoids conflicts in module names or incorrect imports due to the module search
path not being what the author expected. Makes it easier to find modules.

<a id="s2.3.2-cons"></a>
<a id="232-cons"></a>

<a id="packages-cons"></a>

#### 2.3.2 Cons

Makes it harder to deploy code because you have to replicate the package
hierarchy. Not really a problem with modern deployment mechanisms.

<a id="s2.3.3-decision"></a>
<a id="233-decision"></a>

<a id="packages-decision"></a>

#### 2.3.3 Decision

All new code should import each module by its full package name.

Imports should be as follows:

<div class='goodcode'></div>

```python
Yes:
  # Reference absl.flags in code with the complete name (verbose).
  import absl.flags
  from doctor.who import jodie

  _FOO = absl.flags.DEFINE_string(...)
```

<div class='goodcode'></div>

```python
Yes:
  # Reference flags in code with just the module name (common).
  from absl import flags
  from doctor.who import jodie

  _FOO = flags.DEFINE_string(...)
```

*(assume this file lives in `doctor/who/` where `jodie.py` also exists)*

<div class='badcode'></div>

```python
No:
  # Unclear what module the author wanted and what will be imported.  The actual
  # import behavior depends on external factors controlling sys.path.
  # Which possible jodie module did the author intend to import?
  import jodie
```

The directory the main binary is located in should not be assumed to be in
`sys.path` despite that happening in some environments. This being the case,
code should assume that `import jodie` refers to a third-party or top-level
package named `jodie`, not a local `jodie.py`.
