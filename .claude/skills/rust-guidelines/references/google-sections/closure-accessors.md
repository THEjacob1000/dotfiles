Google Rust Style Guide excerpt: `closure-accessors`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="closure-accessors"></a>

#### More on accessors that accept closures

Accessors that accept a closure (`.with_foo()`) are typically invoked as
`object.with_foo(|foo| do_something_with(foo))`. They can be a good choice in
the following situations:

*   When the property is contained in an interior mutability wrapper (e.g.
    `Mutex` or `RefCell`). These mechanisms need to constrain access to the
    property to a scope, and the closure provides this scope. This is usually
    preferable to directly returning the RAII object that implements the scope
    (e.g. `MutexGuard<T>`) because the latter would leak an implementation
    detail.

*   When follow-up work or validation is needed after a property is changed and
    a `set_foo()` accessor cannot be used (for example because the property's
    type is expensive to clone or cannot be cloned at all).

A `with_foo()` accessor will often allow the closure to return a value and
forward it by returning it from `with_foo()`.

If you need to provide two closure-accepting accessors, one for read-only access
and one for mutable access, it is common to name them `with_foo()` and
`with_mut_foo()`. Otherwise, `with_foo()` is often also used for mutating
accessors.
