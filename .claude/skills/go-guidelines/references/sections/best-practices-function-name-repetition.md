<a id="naming"></a>

## Naming

<a id="function-names"></a>

### Function and method names

<a id="function-name-repetition"></a>

#### Avoid repetition

When choosing the name for a function or method, consider the context in which
the name will be read. Consider the following recommendations to avoid excess
[repetition](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#repetition) at the call site:

*   The following can generally be omitted from function and method names:

    *   The types of the inputs and outputs (when there is no collision)
    *   The type of a method's receiver
    *   Whether an input or output is a pointer

*   For functions, do not
    [repeat the name of the package](https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#repetitive-with-package).

    ```go
    // Bad:
    package yamlconfig

    func ParseYAMLConfig(input string) (*Config, error)
    ```

    ```go
    // Good:
    package yamlconfig

    func Parse(input string) (*Config, error)
    ```

*   For methods, do not repeat the name of the method receiver.

    ```go
    // Bad:
    func (c *Config) WriteConfigTo(w io.Writer) (int64, error)
    ```

    ```go
    // Good:
    func (c *Config) WriteTo(w io.Writer) (int64, error)
    ```

*   Do not repeat the names of variables passed as parameters.

    ```go
    // Bad:
    func OverrideFirstWithSecond(dest, source *Config) error
    ```

    ```go
    // Good:
    func Override(dest, source *Config) error
    ```

*   Do not repeat the names and types of the return values.

    ```go
    // Bad:
    func TransformToJSON(input *Config) *jsonconfig.Config
    ```

    ```go
    // Good:
    func Transform(input *Config) *jsonconfig.Config
    ```

When it is necessary to disambiguate functions of a similar name, it is
acceptable to include extra information.

```go
// Good:
func (c *Config) WriteTextTo(w io.Writer) (int64, error)
func (c *Config) WriteBinaryTo(w io.Writer) (int64, error)
```

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/best-practices.md#function-name-repetition. Locally segmented; local links rewritten to this pinned revision. -->
