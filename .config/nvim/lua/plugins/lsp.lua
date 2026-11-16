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
        eslint = {
          -- eslintrc-only projects on ESLint 9 need flat config off; decided per root so flat-config repos keep working
          on_init = function(client)
            local root = client.config.root_dir
            if not root then
              return
            end
            for _, name in ipairs({
              "eslint.config.js",
              "eslint.config.mjs",
              "eslint.config.cjs",
              "eslint.config.ts",
              "eslint.config.mts",
              "eslint.config.cts",
            }) do
              if vim.uv.fs_stat(root .. "/" .. name) then
                return
              end
            end
            -- newer eslint-lsp reads the top-level key, older ones the experimental one
            client.settings.useFlatConfig = false
            client.settings.experimental =
              vim.tbl_extend("force", client.settings.experimental or {}, { useFlatConfig = false })
            client:notify("workspace/didChangeConfiguration", { settings = client.settings })
          end,
        },
        falcon = {
          mason = false,
          filetypes = { "dart" },
          -- live falcon.json reloads; nvim leaves this off on Linux, and without inotifywait its fallback opens a handle per directory
          capabilities = {
            workspace = { didChangeWatchedFiles = { dynamicRegistration = vim.fn.executable("inotifywait") == 1 } },
          },
          -- falcon is pinned per project through mise, so resolve it from the project root rather than nvim's PATH
          cmd = function(dispatchers, config)
            return vim.lsp.rpc.start({ "mise", "exec", "--", "falcon", "lsp" }, dispatchers, { cwd = config.root_dir })
          end,
          root_dir = function(bufnr, on_dir)
            local root = vim.fs.root(bufnr, "falcon.json")
            if root then
              on_dir(root)
            end
          end,
        },
        templ = {
          mason = false,
          -- the LSP must match the module's templ runtime, or its generated Go calls runtime functions that don't exist;
          -- modules pinning templ as a go tool get that exact version, others fall back to templ on PATH
          cmd = function(dispatchers, config)
            local root = config.root_dir
            local gomod = root and io.open(root .. "/go.mod")
            local pinned = false
            if gomod then
              pinned = gomod:read("*a"):find("github.com/a-h/templ/cmd/templ", 1, true) ~= nil
              gomod:close()
            end
            local cmd = pinned and { "go", "tool", "templ", "lsp" } or { "templ", "lsp" }
            return vim.lsp.rpc.start(cmd, dispatchers, { cwd = root })
          end,
        },
      },
    },
  },
}
