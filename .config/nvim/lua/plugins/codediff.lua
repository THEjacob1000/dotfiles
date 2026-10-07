local function jj_commit(rev, cwd)
  local result = vim
    .system({ "jj", "log", "--no-graph", "-r", rev, "-T", "commit_id" }, {
      cwd = cwd,
      text = true,
    })
    :wait()
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
local blame_buffers = {}
local blame_template =
  [[if(commit.current_working_copy(), "Uncommitted changes", commit.author().name() ++ ", " ++ commit.author().timestamp().ago() ++ " · " ++ commit.change_id().shortest(8) ++ " " ++ if(commit.description(), commit.description().first_line(), "(no description)")) ++ "\n"]]

local function blame_target(buf)
  local lifecycle = package.loaded["codediff.ui.lifecycle"]
  local session = lifecycle and lifecycle.get_session(vim.api.nvim_get_current_tabpage())
  if session and (buf == session.original_bufnr or buf == session.modified_bufnr or buf == session.result_bufnr) then
    local side, rev
    if buf == session.original_bufnr then
      side, rev = session.original, session.original_revision
    elseif buf == session.modified_bufnr then
      side, rev = session.modified, session.modified_revision
    else
      return
    end
    if not side or not session.git_root or (rev and rev:match("^:[0-3]:?$")) or rev == "STAGED" or rev == "HEAD" then
      return
    end
    local root = vim.fs.root(session.git_root, ".jj")
    if root then
      local path = vim.fs.relpath(root, vim.fs.joinpath(session.git_root, side.relative))
      return root, (not rev or rev == "WORKING") and "@" or rev, path
    end
    return
  end
  local path = vim.api.nvim_buf_get_name(buf)
  if vim.bo[buf].buftype ~= "" or path == "" or path:match("^%w+://") then
    return
  end
  local root = vim.fs.root(path, ".jj")
  if root then
    return root, "@", vim.fs.relpath(root, path)
  end
end

local function clear_blame(event)
  local state = blame_buffers[event.buf]
  if state then
    state.display = state.display + 1
  end
  if vim.api.nvim_buf_is_valid(event.buf) then
    vim.api.nvim_buf_clear_namespace(event.buf, blame_ns, 0, -1)
  end
end

local function invalidate_blame(event)
  clear_blame(event)
  local state = blame_buffers[event.buf]
  blame_buffers[event.buf] = nil
  if state and state.process then
    state.process:kill(15)
  end
end

local function render_blame(buf, state, display, row)
  if blame_buffers[buf] ~= state or state.display ~= display or not vim.api.nvim_buf_is_valid(buf) then
    return
  end
  local win = vim.api.nvim_get_current_win()
  if vim.bo[buf].modified or vim.api.nvim_win_get_buf(win) ~= buf or vim.api.nvim_win_get_cursor(win)[1] ~= row then
    return
  end
  local root, rev, path = blame_target(buf)
  if root ~= state.root or rev ~= state.rev or path ~= state.path then
    return
  end
  vim.api.nvim_buf_clear_namespace(buf, blame_ns, 0, -1)
  if state.lines[row] then
    vim.api.nvim_buf_set_extmark(
      buf,
      blame_ns,
      row - 1,
      0,
      { virt_text = { { "    " .. state.lines[row], "Comment" } } }
    )
  end
end

local function show_blame()
  local buf = vim.api.nvim_get_current_buf()
  local root, rev, path = blame_target(buf)
  if not root or not path or vim.bo[buf].modified or vim.fn.executable("jj") ~= 1 then
    return clear_blame({ buf = buf })
  end
  local key = root .. "\0" .. rev .. "\0" .. path
  if rev == "@" then
    local stat = vim.uv.fs_stat(vim.fs.joinpath(root, path))
    if not stat or stat.type ~= "file" then
      return invalidate_blame({ buf = buf })
    end
    key = key .. "\0" .. stat.mtime.sec .. "." .. stat.mtime.nsec .. ":" .. stat.size
  end
  local state = blame_buffers[buf]
  if not state or state.key ~= key then
    invalidate_blame({ buf = buf })
    state = { key = key, root = root, rev = rev, path = path, display = 0 }
    blame_buffers[buf] = state
  end
  local row = vim.api.nvim_win_get_cursor(0)[1]
  local display = state.display
  if state.lines then
    return render_blame(buf, state, display, row)
  end
  state.row, state.request_display = row, display
  if state.process then
    return
  end
  local cmd = { "jj", "--color=never", "file", "annotate", "-r", rev, "-T", blame_template, "--", path }
  if rev ~= "@" then
    table.insert(cmd, 2, "--ignore-working-copy")
  end
  state.process = vim.system(cmd, { cwd = root, text = true }, function(result)
    vim.schedule(function()
      if blame_buffers[buf] ~= state or not vim.api.nvim_buf_is_valid(buf) then
        return
      end
      state.process = nil
      if result.code ~= 0 then
        local message = vim.trim(result.stderr or "")
        if message == "" then
          message = "jj file annotate failed with exit code " .. result.code
        end
        if state.error ~= message then
          state.error = message
          vim.notify("JJ blame: " .. message, vim.log.levels.ERROR)
        end
        return
      end
      state.error = nil
      state.lines = vim.split(result.stdout or "", "\n", { plain = true })
      render_blame(buf, state, state.request_display, state.row)
    end)
  end)
end

return {
  {
    "esmuellert/codediff.nvim",
    cmd = "CodeDiff",
    init = function()
      vim.api.nvim_create_autocmd("FileType", { pattern = "codediff-explorer", callback = explorer_keys })
      vim.api.nvim_create_autocmd("User", { pattern = "CodeDiffOpen", callback = remember_bufs })
      vim.api.nvim_create_autocmd("User", { pattern = "CodeDiffClose", callback = wipe_session_bufs })
      local blame_group = vim.api.nvim_create_augroup("JJInlineBlame", { clear = true })
      vim.api.nvim_create_autocmd("CursorHold", { group = blame_group, callback = show_blame })
      vim.api.nvim_create_autocmd(
        { "CursorMoved", "BufLeave", "WinLeave", "InsertEnter" },
        { group = blame_group, callback = clear_blame }
      )
      vim.api.nvim_create_autocmd(
        { "BufEnter", "BufWritePost", "BufFilePost", "TextChanged", "TextChangedI", "BufUnload", "BufWipeout" },
        {
          group = blame_group,
          callback = invalidate_blame,
        }
      )
      vim.api.nvim_create_autocmd("FocusGained", {
        group = blame_group,
        callback = function()
          for buf in pairs(blame_buffers) do
            invalidate_blame({ buf = buf })
          end
        end,
      })
      -- scrollbind only follows the focused window, so wheel over an unfocused pane would scroll it alone
      for _, key in ipairs({ "<ScrollWheelUp>", "<ScrollWheelDown>" }) do
        vim.keymap.set("n", key, bound_wheel(key))
      end
    end,
    keys = {
      {
        "<leader>jd",
        function()
          open_jj_diff("@-")
        end,
        desc = "JJ change diff",
      },
      {
        "<leader>jD",
        function()
          open_jj_diff("fork_point(trunk() | @)")
        end,
        desc = "JJ branch diff",
      },
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
