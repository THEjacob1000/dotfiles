return {
  {
    "lewis6991/gitsigns.nvim",
    opts = {
      current_line_blame = true,
      current_line_blame_opts = {
        delay = 300,
        virt_text_pos = "eol",
      },
      current_line_blame_formatter = "  <author> • <author_time:%R> • <abbrev_sha> • <summary>",
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
