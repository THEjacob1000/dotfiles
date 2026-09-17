<a id="naming"></a>

## Naming

See the naming section within [the core style guide](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/guide.md#naming) for
overarching guidance on naming. The following sections provide further
clarification on specific areas within naming.

<a id="repetition"></a>

### Repetition

<!--
Note to future editors:

Do not use the term "stutter" to refer to cases when a name is repetitive.
-->

A piece of Go source code should avoid unnecessary repetition. One common source
of this is repetitive names, which often include unnecessary words or repeat
their context or type. Code itself can also be unnecessarily repetitive if the
same or a similar code segment appears multiple times in close proximity.

Repetitive naming can come in many forms, including:

<a id="repetitive-with-package"></a>

#### Package vs. exported symbol name

When naming exported symbols, the name of the package is always visible outside
your package, so redundant information between the two should be reduced or
eliminated. If a package exports only one type and it is named after the package
itself, the canonical name for the constructor is `New` if one is required.

> **Examples:** Repetitive Name -> Better Name
>
> *   `widget.NewWidget` -> `widget.New`
> *   `widget.NewWidgetWithName` -> `widget.NewWithName`
> *   `db.LoadFromDatabase` -> `db.Load`
> *   `goatteleportutil.CountGoatsTeleported` -> `gtutil.CountGoatsTeleported`
>     or `goatteleport.Count`
> *   `myteampb.MyTeamMethodRequest` -> `mtpb.MyTeamMethodRequest` or
>     `myteampb.MethodRequest`

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#repetitive-with-package. Locally segmented; local links rewritten to this pinned revision. -->
