<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#line-length. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="s3.2-line-length"></a>
<a id="32-line-length"></a>

<a id="line-length"></a>

### 3.2 Line length

Maximum line length is *80 characters*.

Explicit exceptions to the 80 character limit:

-   Long import statements.
-   URLs, pathnames, or long flags in comments.
-   Long string module-level constants not containing whitespace that would be
    inconvenient to split across lines such as URLs or pathnames.
-   Pylint disable comments. (e.g.: `# pylint: disable=invalid-name`)

Do not use a backslash for
[explicit line continuation](https://docs.python.org/3/reference/lexical_analysis.html#explicit-line-joining).

Instead, make use of Python's
[implicit line joining inside parentheses, brackets and braces](http://docs.python.org/reference/lexical_analysis.html#implicit-line-joining).
If necessary, you can add an extra pair of parentheses around an expression.

Note that this rule doesn't prohibit backslash-escaped newlines within strings
(see [below](https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#strings)).

<div class='goodcode'></div>

```python
Yes: foo_bar(self, width, height, color='black', design=None, x='foo',
             emphasis=None, highlight=0)
```

<div class='goodcode'></div>

```python

Yes: if (width == 0 and height == 0 and
         color == 'red' and emphasis == 'strong'):

     (bridge_questions.clarification_on
      .average_airspeed_of.unladen_swallow) = 'African or European?'

     with (
         very_long_first_expression_function() as spam,
         very_long_second_expression_function() as beans,
         third_thing() as eggs,
     ):
       place_order(eggs, beans, spam, beans)
```

<div class='badcode'></div>

```python

No:  if width == 0 and height == 0 and \
         color == 'red' and emphasis == 'strong':

     bridge_questions.clarification_on \
         .average_airspeed_of.unladen_swallow = 'African or European?'

     with very_long_first_expression_function() as spam, \
           very_long_second_expression_function() as beans, \
           third_thing() as eggs:
       place_order(eggs, beans, spam, beans)
```

When a literal string won't fit on a single line, use parentheses for implicit
line joining.

<div class='goodcode'></div>

```python
x = ('This will build a very long long '
     'long long long long long long string')
```

Prefer to break lines at the highest possible syntactic level. If you must break
a line twice, break it at the same syntactic level both times.

<div class='goodcode'></div>

```python
Yes: bridgekeeper.answer(
         name="Arthur", quest=questlib.find(owner="Arthur", perilous=True))

     answer = (a_long_line().of_chained_methods()
               .that_eventually_provides().an_answer())

     if (
         config is None
         or 'editor.language' not in config
         or config['editor.language'].use_spaces is False
     ):
       use_tabs()
```

<div class='badcode'></div>

```python
No: bridgekeeper.answer(name="Arthur", quest=questlib.find(
        owner="Arthur", perilous=True))

    answer = a_long_line().of_chained_methods().that_eventually_provides(
        ).an_answer()

    if (config is None or 'editor.language' not in config or config[
        'editor.language'].use_spaces is False):
      use_tabs()

```

Within comments, put long URLs on their own line if necessary.

<div class='goodcode'></div>

```python
Yes:  # See details at
      # http://www.example.com/us/developer/documentation/api/content/v2.0/csv_file_name_extension_full_specification.html
```

<div class='badcode'></div>

```python
No:  # See details at
     # http://www.example.com/us/developer/documentation/api/content/\
     # v2.0/csv_file_name_extension_full_specification.html
```

Make note of the indentation of the elements in the line continuation examples
above; see the [indentation](https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#s3.4-indentation) section for explanation.

[Docstring](https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#docstrings) summary lines must remain within the 80 character
limit.

In all other cases where a line exceeds 80 characters, and the
[Black](https://github.com/psf/black) or
[Pyink](https://github.com/google/pyink) auto-formatter does not help bring the
line below the limit, the line is allowed to exceed this maximum. Authors are
encouraged to manually break the line up per the notes above when it is
sensible.
