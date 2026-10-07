return {
  {
    "lewis6991/satellite.nvim",
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
        gitsigns = { enable = false },
        marks = { enable = false },
        quickfix = { enable = false },
        search = { enable = false },
      },
    },
    config = function(_, opts)
      local util = require("satellite.util")
      local signs = {
        add = { symbol = "│", highlight = "MiniDiffSignAdd" },
        change = { symbol = "│", highlight = "MiniDiffSignChange" },
        delete = { symbol = "-", highlight = "MiniDiffSignDelete" },
      }
      local marked_buffers = {}

      require("satellite.handlers").register({
        name = "minidiff",
        config = { overlap = false, priority = 20 },
        setup = function(_, update)
          local group = vim.api.nvim_create_augroup("satellite_minidiff", { clear = true })
          vim.api.nvim_create_autocmd("User", {
            group = group,
            pattern = "MiniDiffUpdated",
            callback = update,
          })
          vim.api.nvim_create_autocmd({ "BufUnload", "BufDelete" }, {
            group = group,
            callback = function(event)
              marked_buffers[event.buf] = nil
              update()
            end,
          })
          -- mini.diff doesn't emit MiniDiffUpdated when clearing or disabling a reference.
          vim.api.nvim_set_decoration_provider(vim.api.nvim_create_namespace("satellite_minidiff"), {
            on_start = function()
              local diff = package.loaded["mini.diff"]
              for bufnr in pairs(marked_buffers) do
                local data = diff and diff.get_buf_data(bufnr)
                if not data or not data.ref_text or #data.hunks == 0 then
                  marked_buffers[bufnr] = nil
                  update()
                end
              end
              return false
            end,
          })
        end,
        update = function(bufnr, winid)
          local diff = package.loaded["mini.diff"]
          local data = diff and diff.get_buf_data(bufnr)
          local marks = {}
          for _, hunk in ipairs(data and data.ref_text and data.hunks or {}) do
            local sign = signs[hunk.type]
            local first = math.max(1, hunk.buf_start)
            local last = math.max(1, hunk.buf_start + math.max(0, hunk.buf_count - 1))
            local first_pos = util.row_to_barpos(winid, first - 1)
            local last_pos = util.row_to_barpos(winid, last - 1)
            for pos = first_pos, last_pos do
              marks[#marks + 1] = {
                pos = pos,
                symbol = sign.symbol,
                highlight = sign.highlight,
              }
            end
          end
          marked_buffers[bufnr] = #marks > 0 or nil
          return marks
        end,
      })
      require("satellite").setup(opts)
      vim.api.nvim_set_hl(0, "SatelliteBar", { bg = "#3b3b3b" })
    end,
  },
}
