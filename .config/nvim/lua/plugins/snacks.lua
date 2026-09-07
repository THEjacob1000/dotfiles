local ignored_file_globs = {
  ".env",
  ".env.*",
  "*.local",
  "*.local.*",
  "google-services.json",
  "GoogleService-Info.plist",
}

local unignored_path_globs = {
  "bench/results",
  "bench/results/**",
}

local ignored_file_args = table.concat(vim.tbl_map(function(pattern)
  return "--glob " .. vim.fn.shellescape(pattern)
end, ignored_file_globs), " ")

local files_command = ("{ rg --files --hidden --glob '!.git' --glob '!.jj'; "
  .. "rg --files --hidden --no-ignore --glob '!.git' --glob '!.jj' %s; } | sort -u"):format(ignored_file_args)

return {
  {
    "folke/snacks.nvim",
    opts = {
      explorer = { enabled = true },
      picker = {
        sources = {
          explorer = {
            hidden = true,
            include = vim.list_extend(vim.deepcopy(ignored_file_globs), unignored_path_globs),
            exclude = { "**/.git", "**/.jj" },
          },
          files = {
            finder = "proc",
            cmd = "sh",
            args = { "-c", files_command },
            format = "file",
            show_empty = true,
            transform = function(item, ctx)
              item.file = item.text
              item.cwd = ctx.filter.cwd
            end,
          },
          grep = {
            hidden = true,
            exclude = { ".git", ".jj" },
          },
        },
      },
    },
  },
}
