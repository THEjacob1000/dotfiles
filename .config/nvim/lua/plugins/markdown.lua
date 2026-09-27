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
      -- "hide" conceals the fence lines, which also hides snacks.image's diagram anchored there
      code = { width = "full", right_pad = 0, border = "none", disable_background = { "diff", "mermaid" } },
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
