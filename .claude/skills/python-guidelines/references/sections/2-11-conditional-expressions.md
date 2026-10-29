<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#conditional-expressions. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="s2.11-conditional-expressions"></a>
<a id="211-conditional-expressions"></a>

<a id="conditional-expressions"></a>

### 2.11 Conditional Expressions

Okay for simple cases.

<a id="s2.11.1-definition"></a>
<a id="2111-definition"></a>

<a id="conditional-expressions-definition"></a>

#### 2.11.1 Definition

Conditional expressions (sometimes called a “ternary operator”) are mechanisms
that provide a shorter syntax for if statements. For example:
`x = 1 if cond else 2`.

<a id="s2.11.2-pros"></a>
<a id="2112-pros"></a>

<a id="conditional-expressions-pros"></a>

#### 2.11.2 Pros

Shorter and more convenient than an if statement.

<a id="s2.11.3-cons"></a>
<a id="2113-cons"></a>

<a id="conditional-expressions-cons"></a>

#### 2.11.3 Cons

May be harder to read than an if statement. The condition may be difficult to
locate if the expression is long.

<a id="s2.11.4-decision"></a>
<a id="2114-decision"></a>

<a id="conditional-expressions-decision"></a>

#### 2.11.4 Decision

Okay to use for simple cases. Each portion must fit on one line:
true-expression, if-expression, else-expression. Use a complete if statement
when things get more complicated.

<div class='goodcode'></div>

```python
Yes:
    one_line = 'yes' if predicate(value) else 'no'
    slightly_split = ('yes' if predicate(value)
                      else 'no, nein, nyet')
    the_longest_ternary_style_that_can_be_done = (
        'yes, true, affirmative, confirmed, correct'
        if predicate(value)
        else 'no, false, negative, nay')
```

<div class='badcode'></div>

```python
No:
    bad_line_breaking = ('yes' if predicate(value) else
                         'no')
    portion_too_long = ('yes'
                        if some_long_module.some_long_predicate_function(
                            really_long_variable_name)
                        else 'no, false, negative, nay')
```
