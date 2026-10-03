-- LSP settings ported from the Zed config
return {
  {
    "mrcjkb/rustaceanvim",
    opts = {
      server = {
        default_settings = {
          ["rust-analyzer"] = {
            -- own target dir, so a stuck check-on-save never holds the build lock other cargo runs need
            -- LazyVim's rust extra turns allFeatures on; every feature combo of every dep gets indexed and checked
            cargo = { targetDir = true, allFeatures = false },
            check = { command = "clippy", workspace = false },
            imports = {
              granularity = { group = "module" },
              group = { enable = true },
              removeUnused = true,
            },
          },
        },
      },
    },
  },
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        vtsls = {
          settings = {
            typescript = { updateImportsOnFileMove = { enabled = "always" } },
            javascript = { updateImportsOnFileMove = { enabled = "always" } },
          },
        },
      },
    },
  },
}
