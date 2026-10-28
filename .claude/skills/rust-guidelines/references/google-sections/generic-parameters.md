Google Rust Style Guide excerpt: `generic-parameters`. Source revision `572c673d9058242c049fbc8248b17029726c7afa`.
Google, CC BY 3.0; see [source and license](../google/upstream.json).
Prose and code are unchanged; local fragment links target bounded excerpts.

<a id="generic-parameters"></a>

### Naming generic parameters

Use a short name for your generic parameters (either single or multi character),
related to the kind of thing they represent. Single-letter generics are okay,
but the letter chosen should be somewhat indicative of the object type, ideally
taken from the most important trait bound.

`T` or `U` are fine when the generics are in a relatively unbound context; i.e.
it is an API intended for use with most types, like `Vec<T>`.
