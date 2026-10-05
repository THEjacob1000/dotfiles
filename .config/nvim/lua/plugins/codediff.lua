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

local function open_jj_diff(rev)
  local cwd = vim.fs.root(0, ".jj") or vim.fs.root(vim.uv.cwd(), ".jj")
  if not cwd or not vim.uv.fs_stat(cwd .. "/.git") then
    vim.notify("CodeDiff requires a colocated jj/git repository", vim.log.levels.ERROR)
    return
  end
  local commit = jj_commit(rev, cwd)
  if commit then
    vim.api.nvim_cmd({ cmd = "CodeDiff", args = { "-C", cwd, commit } }, {})
  end
end

local function preview_on_move(event)
  local last
  vim.api.nvim_create_autocmd("CursorMoved", {
    buffer = event.buf,
    callback = function()
      local explorer = require("codediff.ui.lifecycle").get_panel_view(vim.api.nvim_get_current_tabpage())
      local node = explorer and explorer.tree and explorer.tree:get_node()
      local data = node and node.data
      if not data or data.type == "group" or data.type == "directory" or data == last then
        return
      end
      last = data
      explorer.on_file_select(data)
    end,
  })
end

return {
  {
    "esmuellert/codediff.nvim",
    cmd = "CodeDiff",
    init = function()
      vim.api.nvim_create_autocmd("FileType", { pattern = "codediff-explorer", callback = preview_on_move })
    end,
    keys = {
      { "<leader>jd", function() open_jj_diff("@-") end, desc = "JJ change diff" },
      { "<leader>jD", function() open_jj_diff("fork_point(trunk() | @)") end, desc = "JJ branch diff" },
    },
    opts = {
      diff = { layout = "side-by-side" },
      keymaps = {
        view = {
          toggle_stage = false,
          toggle_staged_view = false,
          stage_hunk = false,
          unstage_hunk = false,
          discard_hunk = false,
        },
        explorer = {
          stage_all = false,
          unstage_all = false,
          restore = false,
          toggle_staged = false,
        },
      },
    },
  },
}
