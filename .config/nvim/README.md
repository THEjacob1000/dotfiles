# 💤 LazyVim

A starter template for [LazyVim](https://github.com/LazyVim/LazyVim).
Refer to the [documentation](https://lazyvim.github.io/installation) to get started.

## JJ editing

Normal file buffers in a jj repository show faded blame on the current line after the cursor rests. Annotations are cached per buffer and refreshed when re-entering the buffer, saving, or returning focus. Blame stays hidden while the buffer has unsaved changes.

`<leader>jd` opens the current jj change in CodeDiff, and `<leader>jD` opens the branch diff. Each diff pane shows blame for its own revision and file path.

The right-hand Satellite scrollbar shows added, changed, and deleted lines from mini.diff's jj `@-` reference, matching the gutter signs. Gitsigns stays disabled.
