Google Rust Style Guide excerpt: `getters-and-setters`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="getters-and-setters"></a>

### Getters and setters

Writing and naming getters and setters should follow these guidelines:

*   `foo()` for a getter that returns `&T`, or `T` by value if `T: Copy`.
*   `foo_mut()` for a getter that returns a `&mut T`.
*   `take_foo()` for a getter that "clears" the value (by setting it to `None`
    or some other default state) and returns the old value.
*   `set_foo()` for a setter that takes a `T` by value.
*   `with_foo()` / `with_mut_foo()` for an accessor that operates via a closure
    (see details [below](closure-accessors.md#closure-accessors)). Such an accessor is invoked as
    `object.with_foo(|foo| frob(foo))`.
*   `replace_foo()` for a setter that returns the old value.

Examples

```rs
impl Stuff {
   fn foo(&self) -> &Foo { ...  }
   fn foo_mut(&mut self) -> &mut Foo { ... }

   /// Sets "baz" property to `None` and returns the old value.
   fn take_baz(&mut self) -> Option<Baz> { ... }

   fn set_foo(&mut self, foo: Foo) { ... }

   /// Calls `f` with a borrow of the "bar" property.
   /// Returns the return value of `f`.
   fn with_bar<R>(&self, f: impl FnOnce(&Bar) -> R) -> R { ... }

   /// Calls `f` with a mutable borrow of the "bar" property.
   /// Returns the return value of `f`.
   fn with_mut_bar<R>(&self, f: impl FnOnce(&mut Bar) -> R) -> R { ... }

   /// Sets "foo" property to `foo` and returns the old value.
   fn replace_foo(&mut self, foo: Foo) -> Foo  { ... }
}
```

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
