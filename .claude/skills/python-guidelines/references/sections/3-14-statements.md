<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#statements. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="s3.14-statements"></a>
<a id="314-statements"></a>

<a id="statements"></a>

### 3.14 Statements

Generally only one statement per line.

However, you may put the result of a test on the same line as the test only if
the entire statement fits on one line. In particular, you can never do so with
`try`/`except` since the `try` and `except` can't both fit on the same line, and
you can only do so with an `if` if there is no `else`.

<div class='goodcode'></div>

```python
Yes:

  if foo: bar(foo)
```

<div class='badcode'></div>

```python
No:

  if foo: bar(foo)
  else:   baz(foo)

  try:               bar(foo)
  except ValueError: baz(foo)

  try:
      bar(foo)
  except ValueError: baz(foo)
```
