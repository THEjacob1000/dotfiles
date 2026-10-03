-- LSP settings ported from the Zed config
return {
  {
    "mrcjkb/rustaceanvim",
    opts = {
      server = {
        -- glibc's per-thread malloc arenas fragment badly under rust-analyzer; measured ~10% less RSS
        cmd_env = { MALLOC_ARENA_MAX = "2" },
        default_settings = {
          ["rust-analyzer"] = {
            -- own target dir, so a stuck check-on-save never holds the build lock other cargo runs need
            -- LazyVim's rust extra turns allFeatures on; every feature combo of every dep gets indexed and checked
            cargo = { targetDir = true, allFeatures = false },
            check = { command = "clippy", workspace = false },
            -- priming eagerly indexes every crate in the graph; lazy indexing measured ~0.8GB lower
            cachePriming = { enable = false },
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
