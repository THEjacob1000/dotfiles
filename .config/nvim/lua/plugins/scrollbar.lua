return {
  {
    "lewis6991/satellite.nvim",
    dependencies = { "lewis6991/gitsigns.nvim" },
    opts = {
      current_only = false,
      winblend = 0,
      excluded_filetypes = {
        "blink-cmp-menu",
        "cmp_docs",
        "cmp_menu",
        "DressingInput",
        "dropbar_menu",
        "dropbar_menu_fzf",
        "noice",
        "prompt",
        "snacks_dashboard",
        "snacks_layout_box",
        "snacks_picker_input",
        "snacks_picker_list",
        "snacks_picker_preview",
        "TelescopePrompt",
      },
      handlers = {
        cursor = { enable = false },
        diagnostic = { enable = false },
        gitsigns = {
          enable = true,
          overlap = true,
        },
        marks = { enable = false },
        quickfix = { enable = false },
        search = { enable = false },
      },
    },
    config = function(_, opts)
      require("satellite").setup(opts)
      vim.api.nvim_set_hl(0, "SatelliteBar", { bg = "#3b3b3b" })
    end,
  },
}
