<a id="errors"></a>

## Errors

<a id="error-strings"></a>

### Error strings

<a id="TOC-ErrorStrings"></a>

Error strings should not be capitalized (unless beginning with an exported name,
a proper noun or an acronym) and should not end with punctuation. This is
because error strings usually appear within other context before being printed
to the user.

```go
// Bad:
err := fmt.Errorf("Something bad happened.")
```

```go
// Good:
err := fmt.Errorf("something bad happened")
```

On the other hand, the style for the full displayed message (logging, test
failure, API response, or other UI) depends, but should typically be
capitalized.

```go
// Good:
log.Infof("Operation aborted: %v", err)
log.Errorf("Operation aborted: %v", err)
t.Errorf("Op(%q) failed unexpectedly; err=%v", args, err)
```

<!-- Source: Google Go Style Guide, https://github.com/google/styleguide/blob/60d2ac7d89ad526937a52571e5e439e01f0af673/go/decisions.md#error-strings. Locally segmented; local links rewritten to this pinned revision. -->
