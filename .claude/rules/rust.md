---
paths:
  - "**/*.rs"
  - "*.rs"
generated-by: numen-sync
---

# How to get Rust right

The most important Rust mantras you can repeat:

1. "If you can move it to compile time, do it at compile time."

2. "Make incorrect program states unrepresentable."
   This one means ensuring that 'failure' paths literally cannot be constructed in code,
   so that you can't accidentally create an invalid state.
   This often involves using enums, structs, and type systems to encode the valid states of your program.

3. "Parametrize everything." (This includes generics/traits)

4. "If you do not need the data after the operation, move it instead of cloning it."

5. "Abuse std library types and traits to encode your domain logic."
   For instance `impl From<ExternalThing> for MyThing` is the most powerful thing you can do.

   Creating methods that are simply `into_my_thing(self) -> MyThing` is a weaker version of that,
   and creating free functions like `fn from_external_thing(external: ExternalThing) -> MyThing` is even weaker.

6. "Returning primitives is almost always a programmer's failure to correctly use the type system."
   This means that if you find yourself returning primitive types (like booleans, integers, tuples) that are meant to represent complex data,
   it's often a sign that you should be defining a new struct or enum to represent that data more clearly, safely
   and to align with the previous rule around making incorrect states unrepresentable.
   Taking them is the same failure and I treat it as a code smell: a function that takes `bool, bool, u32`
   should be taking a struct or an enum.

7. "For borderline cases, a type alias beats an anonymous tuple."

- Enums are a STATE of something.
  Structs are a COLLECTION of data. A zip folder of bytes.

  Methods are _ONLY_ convenience from stealing tropes in other languages.
  Do not be afraid to have free-floating functions that take structs as arguments and return new structs.
