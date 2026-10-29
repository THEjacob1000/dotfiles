<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#todo. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="s3.12-todo-comments"></a>
<a id="312-todo-comments"></a>

<a id="todo"></a>

### 3.12 TODO Comments

Use `TODO` comments for code that is temporary, a short-term solution, or
good-enough but not perfect.

A `TODO` comment begins with the word `TODO` in all caps, and a parenthesized
link to a resource that contains the context, ideally a bug reference. A bug
reference is preferable because bugs are tracked and have follow-up comments.
Follow this piece of context with a colon and an explanatory string.

The purpose is to have a consistent `TODO` format that can be searched to find
out how to get more details.

<div class='goodcode'></div>

```python
# TODO(crbug.com/192795): Investigate cpufreq optimizations.
```

Old style, formerly recommended, but discouraged for use in new code:

```python
# TODO: crbug.com/192795 - Investigate cpufreq optimizations.
```

Avoid adding TODOs that refer to an individual or team as the context:

<div class='badcode'></div>

```python
# TODO(@yourusername): File an issue and use a '*' for repetition.
```

If your `TODO` is of the form "At a future date do something" make sure that you
either include a very specific date ("Fix by November 2009") or a very specific
event ("Remove this code when all clients can handle XML responses.") that
future code maintainers will comprehend. Issues are ideal for tracking this.
