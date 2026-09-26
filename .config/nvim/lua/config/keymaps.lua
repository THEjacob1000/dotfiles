-- Keymaps are automatically loaded on the VeryLazy event
-- Default keymaps that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/keymaps.lua

-- Zed muscle memory
vim.keymap.set("n", "<C-p>", function()
  Snacks.picker.files()
end, { desc = "Find Files" })

-- jj is the VCS here; lazygit (<leader>gg) still works on the colocated git repo
vim.keymap.set("n", "<leader>gJ", function()
  Snacks.terminal({ "jjui" }, { cwd = LazyVim.root.git(), interactive = true })
end, { desc = "jjui (Root Dir)" })

-- Zed's ctrl-j (toggle bottom dock) -> toggle terminal
vim.keymap.set({ "n", "t" }, "<C-j>", function()
  Snacks.terminal.toggle()
end, { desc = "Toggle Terminal" })

vim.keymap.set("n", "<leader>yp", function()
  vim.fn.setreg("+", vim.fn.expand("%"))
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
