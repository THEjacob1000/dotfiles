-- Options are automatically loaded before lazy.nvim startup
-- Default options that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/options.lua

if vim.fn.has("mac") == 1 then
  vim.g.clipboard = {
    name = "pbcopy",
    copy = {
      ["+"] = { "pbcopy" },
      ["*"] = { "pbcopy" },
    },
    paste = {
      ["+"] = { "pbpaste" },
      ["*"] = { "pbpaste" },
    },
    cache_enabled = 0,
  }
else
  vim.g.clipboard = {
    name = "xsel with bounded reads",
    copy = {
      ["+"] = { "xsel", "--nodetach", "-i", "-b" },
      ["*"] = { "xsel", "--nodetach", "-i", "-p" },
    },
    paste = {
      ["+"] = { "timeout", "2s", "xsel", "-o", "-b" },
      ["*"] = { "timeout", "2s", "xsel", "-o", "-p" },
    },
    cache_enabled = 1,
  }
end

vim.opt.clipboard = "unnamedplus"

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
