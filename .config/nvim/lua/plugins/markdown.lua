-- Zed styled markdown text, it never painted the line: no coloured bars behind
-- headings, code blocks the full width of the pane, no linter in prose files.
return {
  {
    "MeanderingProgrammer/render-markdown.nvim",
    opts = {
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
      code = { width = "full", right_pad = 0 },
      checkbox = { enabled = true },
    },
  },
  {
    "mfussenegger/nvim-lint",
    optional = true,
    opts = function(_, opts)
      opts.linters_by_ft.markdown = nil
    end,
  },
}
