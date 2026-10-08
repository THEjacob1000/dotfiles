vim.filetype.add({ extension = { grit = "gritql" } })

vim.api.nvim_create_autocmd("User", {
  pattern = "TSUpdate",
  callback = function()
    require("nvim-treesitter.parsers").gritql = {
      install_info = {
        url = "https://github.com/biomejs/tree-sitter-gritql",
        revision = "7e3e1a74e82c7a5caac1e58884067289f0ebae51",
        queries = "queries",
      },
    }
  end,
})

return {
  { "nvim-treesitter/nvim-treesitter", opts = { ensure_installed = { "rust", "lua", "gritql" } } },
}
