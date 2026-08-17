return {
  {
    "folke/snacks.nvim",
    opts = {
      explorer = { enabled = true },
      picker = {
        sources = {
          explorer = {
            ignored = true,
            hidden = true,
            exclude = { ".git", ".jj", ".next", "node_modules", "target" },
          },
          smart = {
            ignored = true,
            hidden = true,
            exclude = { ".git", ".jj", ".DS_Store", ".next", ".venv", "node_modules", "target" },
          },
          files = {
            ignored = true,
            hidden = true,
            exclude = { ".git", ".jj", ".DS_Store", ".next", ".venv", "node_modules", "target" },
          },
          grep = {
            hidden = true,
            exclude = { ".git", ".jj", ".DS_Store", ".next", ".venv", "node_modules", "target" },
          },
        },
      },
    },
  },
}
