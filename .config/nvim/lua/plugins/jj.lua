-- jj log/status in-editor; jjui stays at <leader>gJ for the full TUI
local change_ids = {}
local refresh_interval = 5000

local function jj_root()
  return vim.fs.root(0, ".jj") or vim.fs.root(vim.uv.cwd(), ".jj")
end

local function refresh_change_id(root)
  local cached = change_ids[root]
  if cached and (cached.pending or vim.uv.now() - cached.updated < refresh_interval) then
    return
  end

  cached = cached or { unique = "", short = "", updated = 0 }
  cached.pending = true
  change_ids[root] = cached

  vim.system({
    "jj",
    "--ignore-working-copy",
    "--repository",
    root,
    "log",
    "--no-graph",
    "--color=never",
    "-r",
    "@",
    "-T",
    'change_id.shortest() ++ "\\t" ++ change_id.shortest(8)',
  }, { text = true }, function(result)
    local unique, short = (result.stdout or ""):match("^([^\t]+)\t([^\r\n]+)")
    cached.unique = result.code == 0 and unique or ""
    cached.short = result.code == 0 and short or ""
    cached.updated = vim.uv.now()
    cached.pending = false
    vim.schedule(function()
      vim.cmd.redrawstatus()
    end)
  end)
end

local function jj_change_id(component)
  local root = jj_root()
  if not root then
    return ""
  end

  refresh_change_id(root)
  local cached = change_ids[root]
  local unique = cached and cached.unique or ""
  local short = cached and cached.short or ""
  return LazyVim.lualine.format(component, unique, "Special") .. short:sub(#unique + 1)
end

local function is_jj_repo()
  return jj_root() ~= nil
end

return {
  {
    "nicolasgb/jj.nvim",
    version = "*",
    cmd = { "J", "Jread", "Jbrowse" },
    keys = {
      { "<leader>gj", "<cmd>J log<cr>", desc = "jj log" },
    },
    opts = {},
  },
  {
    "nvim-lualine/lualine.nvim",
    opts = function(_, opts)
      for index, component in ipairs(opts.sections.lualine_b) do
        if component == "branch" or (type(component) == "table" and component[1] == "branch") then
          opts.sections.lualine_b[index] = { jj_change_id, cond = is_jj_repo }
          table.insert(opts.sections.lualine_b, index + 1, { "branch", cond = function()
            return not is_jj_repo()
          end })
          break
        end
      end
    end,
  },
}
