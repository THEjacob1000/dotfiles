-- Zed's "Sandy Dark" is tokyonight-night with near-black surfaces and a dimmer comment colour
return {
  {
    "folke/tokyonight.nvim",
    opts = {
      style = "night",
      on_colors = function(c)
        c.bg = "#0e0e12" -- Zed's editor pane
        c.bg_dark = "#08080b" -- panels, sidebars, floats
        c.bg_dark1 = "#060608" -- Zed's window background
        c.bg_float = "#08080b"
        c.bg_sidebar = "#08080b"
        c.bg_statusline = "#08080b"
        c.bg_popup = "#08080b"
        c.bg_highlight = "#1e202e" -- active line
        c.comment = "#51597d"
        c.fg_gutter = "#363b54" -- line numbers
      end,
      -- tokyonight tints the background behind markdown headings; Zed coloured
      -- the text and left the line alone
      on_highlights = function(hl, c)
        for i, color in ipairs(c.rainbow) do
          hl["@markup.heading." .. i .. ".markdown"] = { fg = color, bold = true }
        end
      end,
    },
  },
}
