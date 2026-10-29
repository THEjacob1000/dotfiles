<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#whitespace. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="s3.6-whitespace"></a>
<a id="36-whitespace"></a>

<a id="whitespace"></a>

### 3.6 Whitespace

Follow standard typographic rules for the use of spaces around punctuation.

No whitespace inside parentheses, brackets or braces.

<div class='goodcode'></div>

```python
Yes: spam(ham[1], {'eggs': 2}, [])
```

<div class='badcode'></div>

```python
No:  spam( ham[ 1 ], { 'eggs': 2 }, [ ] )
```

No whitespace before a comma, semicolon, or colon. Do use whitespace after a
comma, semicolon, or colon, except at the end of the line.

<div class='goodcode'></div>

```python
Yes: if x == 4:
         print(x, y)
     x, y = y, x
```

<div class='badcode'></div>

```python
No:  if x == 4 :
         print(x , y)
     x , y = y , x
```

No whitespace before the open paren/bracket that starts an argument list,
indexing or slicing.

<div class='goodcode'></div>

```python
Yes: spam(1)
```

<div class='badcode'></div>

```python
No:  spam (1)
```

<div class='goodcode'></div>

```python
Yes: dict['key'] = list[index]
```

<div class='badcode'></div>

```python
No:  dict ['key'] = list [index]
```

No trailing whitespace.

Surround binary operators with a single space on either side for assignment
(`=`), comparisons (`==, <, >, !=, <>, <=, >=, in, not in, is, is not`), and
Booleans (`and, or, not`). Use your better judgment for the insertion of spaces
around arithmetic operators (`+`, `-`, `*`, `/`, `//`, `%`, `**`, `@`).

<div class='goodcode'></div>

```python
Yes: x == 1
```

<div class='badcode'></div>

```python
No:  x<1
```

Never use spaces around `=` when passing keyword arguments or defining a default
parameter value, with one exception:
[when a type annotation is present](https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#typing-default-values), *do* use spaces
around the `=` for the default parameter value.

<div class='goodcode'></div>

```python
Yes: def complex(real, imag=0.0): return Magic(r=real, i=imag)
Yes: def complex(real, imag: float = 0.0): return Magic(r=real, i=imag)
```

<div class='badcode'></div>

```python
No:  def complex(real, imag = 0.0): return Magic(r = real, i = imag)
No:  def complex(real, imag: float=0.0): return Magic(r = real, i = imag)
```

Don't use spaces to vertically align tokens on consecutive lines, since it
becomes a maintenance burden (applies to `:`, `#`, `=`, etc.):

<div class='goodcode'></div>

```python
Yes:
  foo = 1000  # comment
  long_name = 2  # comment that should not be aligned

  dictionary = {
      'foo': 1,
      'long_name': 2,
  }
```

<div class='badcode'></div>

```python
No:
  foo       = 1000  # comment
  long_name = 2     # comment that should not be aligned

  dictionary = {
      'foo'      : 1,
      'long_name': 2,
  }
```
