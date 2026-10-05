-- Keymaps are automatically loaded on the VeryLazy event
-- Default keymaps that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/keymaps.lua

-- Zed muscle memory
vim.keymap.set("n", "<C-p>", function()
  Snacks.picker.files()
end, { desc = "Find Files" })

-- terminals are blocked in options.lua; drop LazyVim's maps so they don't advertise dead keys
for _, map in ipairs({
  { "n", "<leader>ft" },
  { "n", "<leader>fT" },
  { { "n", "t" }, "<c-/>" },
  { { "n", "t" }, "<c-_>" },
  { "n", "<leader>gg" },
  { "n", "<leader>gG" },
  { "n", "<leader>gL" },
  { "n", "<leader>gl" },
  { { "n", "x" }, "<leader>gY" },
  { "x", "<leader>gB" },
}) do
  pcall(vim.keymap.del, map[1], map[2])
end

-- jjui runs in a tmux popup over the editor, so the in-nvim terminal ban stays intact
vim.keymap.set("n", "<leader>gJ", function()
  if not vim.env.TMUX then
    vim.notify("jjui needs tmux", vim.log.levels.WARN)
    return
  end
  local pane = vim.env.TMUX_PANE
  local size = vim.system({ "tmux", "display", "-p", "-t", pane, "#{pane_width} #{pane_height}" }):wait().stdout
  local pane_w, pane_h = size:match("(%d+) (%d+)")
  local w, h = math.floor(pane_w * 0.9), math.floor(pane_h * 0.9)
  -- tmux sizes -w/-h percentages against the whole client, so centre on the pane by hand
  vim.system({
    "tmux", "display-popup", "-E", "-t", pane,
    "-w", tostring(w), "-h", tostring(h),
    "-x", ("#{e|+:#{popup_pane_left},%d}"):format(math.floor((pane_w - w) / 2)),
    "-y", ("#{e|+:#{popup_pane_top},%d}"):format(math.floor((pane_h - h) / 2)),
    "-d", vim.fs.root(0, ".jj") or vim.uv.cwd(), "jjui",
  })
end, { desc = "jjui (Root Dir)" })

vim.keymap.set("n", "<leader>yp", function()
  local path = vim.api.nvim_buf_get_name(0)
  vim.fn.setreg("+", vim.fs.relpath(LazyVim.root(), path) or vim.fn.fnamemodify(path, ":."))
end, { desc = "Yank Relative File Path" })

vim.keymap.set("n", "<leader>yP", function()
  vim.fn.setreg("+", vim.fn.expand("%:p"))
end, { desc = "Yank Absolute File Path" })

vim.keymap.set("n", "<leader>fW", function()
  local view = vim.fn.winsaveview()
  vim.cmd("%s/\\<" .. vim.fn.escape(vim.fn.expand("<cword>"), "/\\") .. "\\>//gn")
  vim.fn.winrestview(view)
end, { desc = "Count Word Under Cursor" })

vim.keymap.set("n", "<leader>U", function()
  vim.cmd.packadd("nvim.undotree")
  vim.cmd.Undotree()
end, { desc = "Undotree" })

vim.keymap.set({ "n", "x" }, "x", '"_x', { desc = "Delete Char Without Yank" })
vim.keymap.set("n", "dd", '"_dd', { desc = "Delete Line Without Yank" })
vim.keymap.set("x", "p", "P", { desc = "Paste Without Yanking Selection" })
