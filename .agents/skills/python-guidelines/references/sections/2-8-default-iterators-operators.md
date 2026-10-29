<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#default-iterators-operators. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="s2.8-default-iterators-and-operators"></a>

<a id="default-iterators-operators"></a>

### 2.8 Default Iterators and Operators

Use default iterators and operators for types that support them, like lists,
dictionaries, and files.

<a id="s2.8.1-definition"></a>
<a id="281-definition"></a>

<a id="default-iterators-operators-definition"></a>

#### 2.8.1 Definition

Container types, like dictionaries and lists, define default iterators and
membership test operators ("in" and "not in").

<a id="s2.8.2-pros"></a>
<a id="282-pros"></a>

<a id="default-iterators-operators-pros"></a>

#### 2.8.2 Pros

The default iterators and operators are simple and efficient. They express the
operation directly, without extra method calls. A function that uses default
operators is generic. It can be used with any type that supports the operation.

<a id="s2.8.3-cons"></a>
<a id="283-cons"></a>

<a id="default-iterators-operators-cons"></a>

#### 2.8.3 Cons

You can't tell the type of objects by reading the method names (unless the
variable has type annotations). This is also an advantage.

<a id="s2.8.4-decision"></a>
<a id="284-decision"></a>

<a id="default-iterators-operators-decision"></a>

#### 2.8.4 Decision

Use default iterators and operators for types that support them, like lists,
dictionaries, and files. The built-in types define iterator methods, too. Prefer
these methods to methods that return lists, except that you should not mutate a
container while iterating over it.

<div class='goodcode'></div>

```python
Yes:  for key in adict: ...
      if obj in alist: ...
      for line in afile: ...
      for k, v in adict.items(): ...
```

<div class='badcode'></div>

```python
No:   for key in adict.keys(): ...
      for line in afile.readlines(): ...
```
