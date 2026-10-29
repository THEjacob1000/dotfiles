<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#main. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="main"></a>

### 3.17 Main

In Python, `pydoc` as well as unit tests require modules to be importable. If a
file is meant to be used as an executable, its main functionality should be in a
`main()` function, and your code should always check `if __name__ == '__main__'`
before executing your main program, so that it is not executed when the module
is imported.

When using [absl](https://github.com/abseil/abseil-py), use `app.run`:

<div class='goodcode'></div>

```python
from absl import app
...

def main(argv: Sequence[str]):
    # process non-flag arguments
    ...

if __name__ == '__main__':
    app.run(main)
```

Otherwise, use:

<div class='goodcode'></div>

```python
def main():
    ...

if __name__ == '__main__':
    main()
```

All code at the top level will be executed when the module is imported. Be
careful not to call functions, create objects, or perform other operations that
should not be executed when the file is being `pydoc`ed.
