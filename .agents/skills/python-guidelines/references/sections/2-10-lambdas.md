<!-- Source: Google Python Style Guide, https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#lambdas. Locally segmented; relative links rewritten to this pinned revision. -->

<a id="s2.10-lambda-functions"></a>
<a id="210-lambda-functions"></a>

<a id="lambdas"></a>

### 2.10 Lambda Functions

Okay for one-liners. Prefer generator expressions over `map()` or `filter()`
with a `lambda`.

<a id="s2.10.1-definition"></a>
<a id="2101-definition"></a>

<a id="lambdas-definition"></a>

#### 2.10.1 Definition

Lambdas define anonymous functions in an expression, as opposed to a statement.

<a id="s2.10.2-pros"></a>
<a id="2102-pros"></a>

<a id="lambdas-pros"></a>

#### 2.10.2 Pros

Convenient.

<a id="s2.10.3-cons"></a>
<a id="2103-cons"></a>

<a id="lambdas-cons"></a>

#### 2.10.3 Cons

Harder to read and debug than local functions. The lack of names means stack
traces are more difficult to understand. Expressiveness is limited because the
function may only contain an expression.

<a id="s2.10.4-decision"></a>
<a id="2104-decision"></a>

<a id="lambdas-decision"></a>

#### 2.10.4 Decision

Lambdas are allowed. If the code inside the lambda function spans multiple lines
or is longer than 60-80 chars, it might be better to define it as a regular
[nested function](https://github.com/google/styleguide/blob/8e035461436fa0bd20650d7b01fae92dd8f9a77b/pyguide.md#lexical-scoping).

For common operations like multiplication, use the functions from the `operator`
module instead of lambda functions. For example, prefer `operator.mul` to
`lambda x, y: x * y`.
