return {
  { "lewis6991/gitsigns.nvim", enabled = false },
  {
    "nvim-mini/mini.diff",
    event = "BufReadPost",
    keys = {
      { "<leader>go", function() require("mini.diff").toggle_overlay(0) end, desc = "Toggle JJ diff overlay" },
    },
    config = function()
      local diff = require("mini.diff")
      local buffers = {}
      local function refresh(buf)
        local state = buffers[buf]
        if not state then
          return
        end
        state.generation = state.generation + 1
        local generation = state.generation
        local fileset = 'root-file:"' .. state.path:gsub("\\", "\\\\"):gsub('"', '\\"') .. '"'
        vim.system({ "jj", "--ignore-working-copy", "file", "show", "-r", "@-", "--", fileset }, {
          cwd = state.root,
          text = true,
        }, function(result)
          vim.schedule(function()
            if buffers[buf] ~= state or state.generation ~= generation or not vim.api.nvim_buf_is_valid(buf) then
              return
            end
            if result.code == 0 then
              diff.set_ref_text(buf, result.stdout or "")
            elseif (result.stderr or ""):find("No such path:", 1, true) then
              diff.set_ref_text(buf, {})
            else
              vim.notify(vim.trim(result.stderr or "JJ reference failed"), vim.log.levels.ERROR)
            end
          end)
        end)
      end
      diff.setup({
        view = { style = "sign" },
        mappings = { apply = "" },
        source = {
          name = "jj",
          attach = function(buf)
            local path = vim.api.nvim_buf_get_name(buf)
            local root = vim.fs.root(path, ".jj")
            if path == "" then
              return false
            end
            if not root then
              return false
            end
            local relative = vim.fs.relpath(root, path)
            if not relative then
              return false
            end
            buffers[buf] = { root = root, path = relative, generation = 0 }
            refresh(buf)
          end,
          detach = function(buf)
            buffers[buf] = nil
          end,
        },
      })
      vim.api.nvim_create_autocmd({ "BufEnter", "BufWritePost", "FocusGained" }, {
        group = vim.api.nvim_create_augroup("JJMiniDiff", { clear = true }),
        callback = function(event)
          if event.event == "FocusGained" then
            for buf in pairs(buffers) do
              refresh(buf)
            end
          else
            refresh(event.buf)
          end
        end,
      })
    end,
  },
}
