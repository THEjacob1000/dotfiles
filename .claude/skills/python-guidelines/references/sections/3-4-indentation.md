<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#indentation. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="s3.4-indentation"></a>
<a id="34-indentation"></a>

<a id="indentation"></a>

### 3.4 Indentation

Indent your code blocks with *4 spaces*.

Never use tabs. Implied line continuation should align wrapped elements
vertically (see [line length examples](https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#s3.2-line-length)), or use a hanging
4-space indent. Closing (round, square or curly) brackets can be placed at the
end of the expression, or on separate lines, but then should be indented the
same as the line with the corresponding opening bracket.

<div class='goodcode'></div>

```python
Yes:   # Aligned with opening delimiter.
       foo = long_function_name(var_one, var_two,
                                var_three, var_four)
       meal = (spam,
               beans)

       # Aligned with opening delimiter in a dictionary.
       foo = {
           'long_dictionary_key': value1 +
                                  value2,
           ...
       }

       # 4-space hanging indent; nothing on first line.
       foo = long_function_name(
           var_one, var_two, var_three,
           var_four)
       meal = (
           spam,
           beans)

       # 4-space hanging indent; nothing on first line,
       # closing parenthesis on a new line.
       foo = long_function_name(
           var_one, var_two, var_three,
           var_four
       )
       meal = (
           spam,
           beans,
       )

       # 4-space hanging indent in a dictionary.
       foo = {
           'long_dictionary_key':
               long_dictionary_value,
           ...
       }
```

<div class='badcode'></div>

```python
No:    # Stuff on first line forbidden.
       foo = long_function_name(var_one, var_two,
           var_three, var_four)
       meal = (spam,
           beans)

       # 2-space hanging indent forbidden.
       foo = long_function_name(
         var_one, var_two, var_three,
         var_four)

       # No hanging indent in a dictionary.
       foo = {
           'long_dictionary_key':
           long_dictionary_value,
           ...
       }
```

<a id="s3.4.1-trailing-comma"></a>
<a id="s3.4.1-trailing-commas"></a>
<a id="s3.4.1-trailing_comma"></a>
<a id="s3.4.1-trailing_commas"></a>
<a id="341-trailing_comma"></a>
<a id="341-trailing_commas"></a>
<a id="trailing_comma"></a>
<a id="trailing_commas"></a>

<a id="trailing-comma"></a>

#### 3.4.1 Trailing commas in sequences of items?

Trailing commas in sequences of items are recommended only when the closing
container token `]`, `)`, or `}` does not appear on the same line as the final
element, as well as for tuples with a single element. The presence of a trailing
comma is also used as a hint to our Python code auto-formatter
[Black](https://github.com/psf/black) or
[Pyink](https://github.com/google/pyink) to direct it to auto-format the
container of items to one item per line when the `,` after the final element is
present.

<div class='goodcode'></div>

```python
Yes:   golomb3 = [0, 1, 3]
       golomb4 = [
           0,
           1,
           4,
           6,
       ]
```

<div class='badcode'></div>

```python
No:    golomb4 = [
           0,
           1,
           4,
           6,]
```
