return {
  {
    "kevinhwang91/nvim-ufo",
    dependencies = { "kevinhwang91/promise-async" },
    event = "LazyFile",
    opts = {
      provider_selector = function()
        return { "treesitter", "indent" }
      end,
    },
    keys = {
      {
        "zR",
        function()
          require("ufo").openAllFolds()
        end,
        desc = "Open All Folds",
      },
      {
        "zM",
        function()
          require("ufo").closeAllFolds()
        end,
        desc = "Close All Folds",
      },
      {
        "zK",
        function()
          require("ufo").peekFoldedLinesUnderCursor()
        end,
        desc = "Peek Fold",
      },
    },
  },
  {
    "kevinhwang91/nvim-hlslens",
    opts = { calm_down = true },
    keys = {
      -- keeps LazyVim's direction-stable n/N and zv unfold
      {
        "n",
        [[<Cmd>execute('normal! ' . v:count1 . 'Nn'[v:searchforward] . 'zv')<CR><Cmd>lua require('hlslens').start()<CR>]],
        desc = "Next Search Result",
      },
      {
        "N",
        [[<Cmd>execute('normal! ' . v:count1 . 'nN'[v:searchforward] . 'zv')<CR><Cmd>lua require('hlslens').start()<CR>]],
        desc = "Prev Search Result",
      },
      { "*", [[*<Cmd>lua require('hlslens').start()<CR>]], desc = "Search Word Forward" },
      { "#", [[#<Cmd>lua require('hlslens').start()<CR>]], desc = "Search Word Backward" },
      { "g*", [[g*<Cmd>lua require('hlslens').start()<CR>]], desc = "Search Partial Word Forward" },
      { "g#", [[g#<Cmd>lua require('hlslens').start()<CR>]], desc = "Search Partial Word Backward" },
    },
  },
  {
    "rmagatti/goto-preview",
    dependencies = { "rmagatti/logger.nvim" },
    opts = {},
    keys = {
      {
        "gpd",
        function()
          require("goto-preview").goto_preview_definition()
        end,
        desc = "Peek Definition",
      },
      {
        "gpt",
        function()
          require("goto-preview").goto_preview_type_definition()
        end,
        desc = "Peek Type Definition",
      },
      {
        "gpi",
        function()
          require("goto-preview").goto_preview_implementation()
        end,
        desc = "Peek Implementation",
      },
      {
        "gpr",
        function()
          require("goto-preview").goto_preview_references()
        end,
        desc = "Peek References",
      },
      {
        "gP",
        function()
          require("goto-preview").close_all_win()
        end,
        desc = "Close Peek Windows",
      },
    },
  },
  {
    "sindrets/winshift.nvim",
    cmd = "WinShift",
    opts = {},
    keys = {
      { "<C-w>m", "<cmd>WinShift<cr>", desc = "Move Window" },
      { "<C-w>X", "<cmd>WinShift swap<cr>", desc = "Swap Window" },
    },
  },
  {
    "chentoast/marks.nvim",
    event = "LazyFile",
    opts = {},
  },
  { "wsdjeg/vim-fetch", lazy = false },
}
