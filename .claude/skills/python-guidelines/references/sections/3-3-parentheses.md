<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#parentheses. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="s3.3-parentheses"></a>
<a id="33-parentheses"></a>

<a id="parentheses"></a>

### 3.3 Parentheses

Use parentheses sparingly.

It is fine, though not required, to use parentheses around tuples. Do not use
them in return statements or conditional statements unless using parentheses for
implied line continuation or to indicate a tuple.

<div class='goodcode'></div>

```python
Yes: if foo:
         bar()
     while x:
         x = bar()
     if x and y:
         bar()
     if not x:
         bar()
     # For a 1 item tuple the ()s are more visually obvious than the comma.
     onesie = (foo,)
     return foo
     return spam, beans
     return (spam, beans)
     for (x, y) in dict.items(): ...
```

<div class='badcode'></div>

```python
No:  if (x):
         bar()
     if not(x):
         bar()
     return (foo)
```
