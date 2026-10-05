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

local function file_row(ctx)
  local left = {
    { segments = require("codediff.ui.explorer.formatters.common").prefix(ctx) },
    { segments = { { text = ctx.filename, hl = ctx.status_hl } }, truncate_priority = 2 },
  }
  if ctx.directory ~= "" then
    left[#left + 1] = {
      segments = { { text = " " .. ctx.directory, hl = "ExplorerDirectorySmall" } },
      truncate_priority = 1,
    }
  end
  return { left = left, right = {} }
end

local function explorer_keys(event)
  vim.keymap.set("n", "l", "<CR>", { buffer = event.buf, remap = true, desc = "Open diff / expand" })
  vim.keymap.set("n", "h", "zc", { buffer = event.buf, remap = true, desc = "Collapse folder" })
end

local function bound_wheel(key)
  return function()
    local win = vim.fn.getmousepos().winid
    if win ~= 0 and win ~= vim.api.nvim_get_current_win() and vim.wo[win].scrollbind then
      vim.api.nvim_set_current_win(win)
    end
    vim.api.nvim_feedkeys(vim.keycode(key), "n", false)
  end
end

local preexisting_bufs = {}

local function remember_bufs(event)
  preexisting_bufs[event.data.tabpage] = vim.api.nvim_list_bufs()
end

local function wipe_session_bufs(event)
  local keep = {}
  for _, buf in ipairs(preexisting_bufs[event.data.tabpage] or {}) do
    keep[buf] = true
  end
  preexisting_bufs[event.data.tabpage] = nil
  vim.schedule(function()
    for _, buf in ipairs(vim.api.nvim_list_bufs()) do
      local stray = not keep[buf] and vim.bo[buf].buflisted and vim.bo[buf].buftype == "" and not vim.bo[buf].modified
      if stray and vim.fn.bufwinid(buf) == -1 then
        vim.api.nvim_buf_delete(buf, {})
      end
    end
  end)
end

local blame_ns = vim.api.nvim_create_namespace("codediff_jj_blame")
local blame_cache = {}
local blame_template = [[if(commit.current_working_copy(), "Uncommitted changes", commit.author().name() ++ ", " ++ commit.author().timestamp().ago() ++ " · " ++ commit.change_id().shortest(8) ++ " " ++ if(commit.description(), commit.description().first_line(), "(no description)")) ++ "\n"]]

local function blame_target(buf)
  local lifecycle = package.loaded["codediff.ui.lifecycle"]
  local tabpage = lifecycle and lifecycle.find_tabpage_by_buffer(buf)
  local session = tabpage and lifecycle.get_session(tabpage)
  if not session then
    return
  end
  if buf == session.original_bufnr and session.original then
    return session.git_root, session.original_revision or "@", session.original.relative
  end
  if buf == session.modified_bufnr and session.modified then
    return session.git_root, session.modified_revision or "@", session.modified.relative
  end
end

local function render_blame(buf, row, lines)
  vim.api.nvim_buf_clear_namespace(buf, blame_ns, 0, -1)
  local win = vim.api.nvim_get_current_win()
  if lines[row] and vim.api.nvim_win_get_buf(win) == buf and vim.api.nvim_win_get_cursor(win)[1] == row then
    vim.api.nvim_buf_set_extmark(buf, blame_ns, row - 1, 0, { virt_text = { { "    " .. lines[row], "Comment" } } })
  end
end

local function show_blame()
  local buf = vim.api.nvim_get_current_buf()
  local root, rev, path = blame_target(buf)
  if not root or rev == ":0" or vim.bo[buf].modified then
    return
  end
  local key = rev .. "\0" .. path
  if rev == "@" then
    local stat = vim.uv.fs_stat(root .. "/" .. path)
    if not stat then
      return
    end
    key = key .. "\0" .. stat.mtime.sec .. "." .. stat.mtime.nsec
  end
  local row = vim.api.nvim_win_get_cursor(0)[1]
  if blame_cache[key] then
    return render_blame(buf, row, blame_cache[key])
  end
  local cmd = { "jj", "--color=never", "file", "annotate", "-r", rev, "-T", blame_template, path }
  if rev ~= "@" then
    table.insert(cmd, 2, "--ignore-working-copy")
  end
  vim.system(cmd, { cwd = root, text = true }, function(result)
    if result.code ~= 0 then
      return
    end
    vim.schedule(function()
      blame_cache[key] = vim.split(result.stdout, "\n", { plain = true })
      if vim.api.nvim_buf_is_valid(buf) then
        render_blame(buf, row, blame_cache[key])
      end
    end)
  end)
end

local function clear_blame(event)
  vim.api.nvim_buf_clear_namespace(event.buf, blame_ns, 0, -1)
end

return {
  {
    "esmuellert/codediff.nvim",
    cmd = "CodeDiff",
    init = function()
      vim.api.nvim_create_autocmd("FileType", { pattern = "codediff-explorer", callback = explorer_keys })
      vim.api.nvim_create_autocmd("User", { pattern = "CodeDiffOpen", callback = remember_bufs })
      vim.api.nvim_create_autocmd("User", { pattern = "CodeDiffClose", callback = wipe_session_bufs })
      vim.api.nvim_create_autocmd("CursorHold", { callback = show_blame })
      vim.api.nvim_create_autocmd({ "CursorMoved", "BufLeave", "InsertEnter" }, { callback = clear_blame })
      -- scrollbind only follows the focused window, so wheel over an unfocused pane would scroll it alone
      for _, key in ipairs({ "<ScrollWheelUp>", "<ScrollWheelDown>" }) do
        vim.keymap.set("n", key, bound_wheel(key))
      end
    end,
    keys = {
      { "<leader>jd", function() open_jj_diff("@-") end, desc = "JJ change diff" },
      { "<leader>jD", function() open_jj_diff("fork_point(trunk() | @)") end, desc = "JJ branch diff" },
    },
    opts = {
      diff = { layout = "side-by-side" },
      explorer = {
        view_mode = "tree",
        formatters = { file = file_row },
      },
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
