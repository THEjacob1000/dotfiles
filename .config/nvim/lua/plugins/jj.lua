-- jj log/status in-editor; jjui stays at <leader>gJ for the full TUI
return {
  {
    "nicolasgb/jj.nvim",
    version = "*",
    cmd = { "J", "Jread", "Jbrowse" },
    keys = {
      { "<leader>gj", "<cmd>J log<cr>", desc = "jj log" },
    },
    opts = {},
  },
}
