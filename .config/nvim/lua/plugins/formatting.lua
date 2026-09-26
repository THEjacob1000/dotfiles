-- ponytail: conform takes over rust formatting so the decimal-separator pass
-- (ported from Zed's external formatter) can run after rustfmt
return {
  {
    "stevearc/conform.nvim",
    opts = {
      formatters_by_ft = {
        rust = { "rustfmt", "rust_decimals" },
      },
      formatters = {
        rust_decimals = {
          command = vim.fn.expand("~/.config/nvim/formatters/rust_decimal_separators.py"),
          stdin = true,
        },
      },
    },
  },
  -- the markdown extra already lists prettier for markdown; it just was never installed
  {
    "mason-org/mason.nvim",
    opts = { ensure_installed = { "prettier" } },
  },
}
