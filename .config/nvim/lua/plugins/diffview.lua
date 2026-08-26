local function jj_commit(rev, cwd)
  local result = vim.system({ "jj", "log", "--no-graph", "-r", rev, "-T", "commit_id" }, {
    cwd = cwd,
    text = true,
  }):wait()
  local commit = vim.trim(result.stdout or "")
  if result.code ~= 0 or #commit ~= 40 or not commit:match("^%x+$") then
    local message = vim.trim(result.stderr or "")
    vim.notify(message ~= "" and message or "Could not resolve jj revision " .. rev, vim.log.levels.ERROR)
    return
  end
  return commit
end

local function open_jj_diff(left, operator, right)
  local cwd = vim.fs.root(0, { ".jj", ".git" }) or vim.uv.cwd()
  if not vim.uv.fs_stat(cwd .. "/.git") then
    vim.notify("Diffview requires a colocated jj/git repository", vim.log.levels.ERROR)
    return
  end
  local left_commit = jj_commit(left, cwd)
  if not left_commit then
    return
  end
  local right_commit = jj_commit(right, cwd)
  if not right_commit then
    return
  end
  vim.api.nvim_cmd({
    cmd = "DiffviewOpen",
    args = { "-C" .. cwd, left_commit .. operator .. right_commit },
  }, {})
end

return {
  {
    "sindrets/diffview.nvim",
    cmd = {
      "DiffviewClose",
      "DiffviewFileHistory",
      "DiffviewFocusFiles",
      "DiffviewOpen",
      "DiffviewRefresh",
      "DiffviewToggleFiles",
    },
    keys = {
      {
        "<leader>jd",
        function()
          open_jj_diff("@-", "..", "@")
        end,
        desc = "JJ change diff",
      },
      {
        "<leader>jD",
        function()
          open_jj_diff("trunk()", "...", "@")
        end,
        desc = "JJ branch diff",
      },
      { "<leader>gd", "<cmd>DiffviewOpen<cr>", desc = "Git Diff View" },
      { "<leader>gD", "<cmd>DiffviewClose<cr>", desc = "Close Diff View" },
      { "<leader>gH", "<cmd>DiffviewFileHistory %<cr>", desc = "Git File History" },
    },
    opts = {},
  },
}
