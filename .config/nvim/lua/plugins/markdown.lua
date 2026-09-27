-- Zed styled markdown text, it never painted the line: no coloured bars behind
-- headings, code blocks the full width of the pane, no linter in prose files.
return {
  {
    "brianhuster/live-preview.nvim",
    cmd = "LivePreview",
    dependencies = { "folke/snacks.nvim" },
    keys = {
      { "<leader>mp", "<cmd>LivePreview start<cr>", desc = "Markdown Preview" },
      { "<leader>mP", "<cmd>LivePreview close<cr>", desc = "Close Markdown Preview" },
    },
  },
  {
    "MeanderingProgrammer/render-markdown.nvim",
    init = function()
      -- render-markdown only draws the header delimiter, so wrapped multi-line rows run together;
      -- add a ├─┼─┤ rule under every body row except the last, like GitHub's row lines
      vim.api.nvim_create_autocmd("User", {
        pattern = "LazyLoad",
        callback = function(ev)
          if ev.data ~= "render-markdown.nvim" then
            return
          end
          local Table = require("render-markdown.render.markdown.table")
          local run = Table.run
          Table.run = function(self)
            local rows = self.data.rows
            local separators = {} ---@type table<integer, table>
            if self.config.border_enabled and self.data.layout.valid then
              local border = self.config.border
              local parts = vim.tbl_map(function(col)
                return border[11]:rep(col.width)
              end, self.data.cols)
              local text = border[4] .. table.concat(parts, border[5]) .. border[6]
              for i = 2, #rows - 1 do
                local line = self:line():pad(self.data.layout.col):text(text, self.config.row)
                separators[rows[i].node.start_row] = self:indent():line(true):extend(line):get()
              end
            end
            -- wrapped rows are replaced by virtual lines, so the rule joins those; the rest get their own
            local replace = self.marks.replace
            self.marks.replace = function(marks, config, node, lines)
              local separator = separators[node.start_row]
              if separator then
                lines[#lines + 1] = separator
                separators[node.start_row] = nil
              end
              return replace(marks, config, node, lines)
            end
            run(self)
            self.marks.replace = nil
            for start_row, separator in pairs(separators) do
              self.marks:add(self.config, "virtual_lines", start_row, 0, { virt_lines = { separator } })
            end
          end
        end,
      })
    end,
    opts = {
      enabled = true,
      render_modes = true,
      anti_conceal = { enabled = false },
      win_options = {
        conceallevel = { rendered = 3 },
        concealcursor = { rendered = "" },
      },
      -- an empty list can't win a deep merge against the plugin's defaults, so
      -- point the per-level bars at the fg-only heading groups instead
      heading = {
        backgrounds = {
          "RenderMarkdownH1",
          "RenderMarkdownH2",
          "RenderMarkdownH3",
          "RenderMarkdownH4",
          "RenderMarkdownH5",
          "RenderMarkdownH6",
        },
      },
      -- "hide" conceals the fence lines, which also hides snacks.image's diagram anchored there;
      -- mermaid is left to snacks, whose diagram starts on the fence line render-markdown would paint over
      code = { width = "full", right_pad = 0, border = "none", disable = { "mermaid" } },
      checkbox = { enabled = true },
    },
    keys = {
      { "<leader>um", "<cmd>RenderMarkdown buf_toggle<cr>", desc = "Toggle Markdown Render" },
    },
  },
  {
    "mfussenegger/nvim-lint",
    optional = true,
    opts = function(_, opts)
      opts.linters_by_ft.markdown = nil
    end,
  },
  {
    "HakonHarnes/img-clip.nvim",
    opts = {
      default = { dir_path = "assets", relative_to_current_file = true, prompt_for_file_name = false },
    },
    keys = {
      { "<leader>mi", "<cmd>PasteImage<cr>", desc = "Paste Image From Clipboard" },
    },
  },
  {
    "obsidian-nvim/obsidian.nvim",
    version = "*",
    ft = "markdown",
    cmd = "Obsidian",
    opts = {
      legacy_commands = false,
      workspaces = {
        { name = "jacob", path = "~/Documents/Jacob's Vault" },
      },
      -- otherwise every save rewrites the note's id/aliases/tags block
      frontmatter = { enabled = false },
      picker = { name = "snacks.picker" },
      -- render-markdown already draws checkboxes and links
      ui = { enable = false },
    },
  },
}
