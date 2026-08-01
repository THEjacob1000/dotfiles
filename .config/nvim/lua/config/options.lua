-- Options are automatically loaded before lazy.nvim startup
-- Default options that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/options.lua

-- filetype overrides ported from Zed
vim.filetype.add({
  extension = { conf = "sh" },
  filename = { [".dev.vars"] = "sh", [".envrc"] = "sh" },
  pattern = {
    ["%.envrc%..*"] = "sh",
    ["%.bazelrc%..*"] = "bzl",
    ["Dockerfile.*"] = "dockerfile",
  },
})
