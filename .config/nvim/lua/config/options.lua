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

-- no terminals: block every process-backed terminal, whether a plugin, :terminal or a keymap asks
local function refuse_terminal()
  vim.notify("Terminals are disabled in this config", vim.log.levels.WARN)
  return -1
end
vim.fn.termopen = refuse_terminal
local jobstart = vim.fn.jobstart
vim.fn.jobstart = function(cmd, opts, ...)
  if type(opts) == "table" and opts.term then
    return refuse_terminal()
  end
  return jobstart(cmd, opts or vim.empty_dict(), ...)
end
-- :terminal bypasses vim.fn, so kill it on open; display-only buffers from nvim_open_term have no job and survive
vim.api.nvim_create_autocmd("TermOpen", {
  group = vim.api.nvim_create_augroup("jacob_no_terminal", { clear = true }),
  callback = function(args)
    local job = vim.b[args.buf].terminal_job_id
    if not job then
      return
    end
    vim.fn.jobstop(job)
    refuse_terminal()
    vim.schedule(function()
      if vim.api.nvim_buf_is_valid(args.buf) then
        vim.api.nvim_buf_delete(args.buf, { force = true })
      end
    end)
  end,
})
