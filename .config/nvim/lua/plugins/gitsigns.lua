return {
  {
    "lewis6991/gitsigns.nvim",
    opts = {
      current_line_blame = true,
    },
    keys = {
      {
        "<leader>ght",
        function()
          require("gitsigns").toggle_current_line_blame()
        end,
        desc = "Toggle Current Line Blame",
      },
    },
  },
}
