---
condition:
  - "**/*.tsx"
  - "*.tsx"
  - "**/*.jsx"
  - "*.jsx"
  - "**/*.vue"
  - "*.vue"
  - "**/*.svelte"
  - "*.svelte"
  - "**/*.astro"
  - "*.astro"
  - "**/*.css"
  - "*.css"
  - "**/*.scss"
  - "*.scss"
  - "**/*.html"
  - "*.html"
interruptMode: never
generated-by: numen-sync
---

# How to get frontend design right

When a change affects how an interface looks, moves or reads, use the `frontend-design` skill before editing. It routes the task to one pinned upstream design skill. Changes that leave the rendered result alone don't need it.

The user's brief and the project's existing design system take precedence over upstream taste. Build from the project's existing components and tokens, extending them rather than restyling one page on its own.
