local ignored_file_globs = {
  ".env",
  ".env.*",
  "*.local",
  "*.local.*",
  "google-services.json",
  "GoogleService-Info.plist",
}

local unignored_path_globs = {
  "bench/results",
  "bench/results/**",
}

local ignored_file_args = table.concat(
  vim.tbl_map(function(pattern)
    return "--glob " .. vim.fn.shellescape(pattern)
  end, ignored_file_globs),
  " "
)

local files_command = (
  "{ rg --files --hidden --glob '!.git' --glob '!.jj'; "
  .. "rg --files --hidden --no-ignore --glob '!.git' --glob '!.jj' %s; } | sort -u"
):format(ignored_file_args)

return {
  {
    "folke/snacks.nvim",
    init = function()
      -- with extended-keys on, snacks reads tmux's client_termname (xterm-256color) and misses Ghostty;
      -- check every client on this session, since the most recent one may be a nested tmux over ssh
      if
        vim.env.TMUX
        and vim.fn
          .system({ "tmux", "list-clients", "-t", vim.env.TMUX_PANE or "", "-F", "#{client_termtype}" })
          :find("ghostty")
      then
        vim.env.SNACKS_GHOSTTY = "1"
      end
      -- snacks.image keeps conceal_lines when it hides a diagram for editing, so source lines
      -- past the image's height stayed hidden; still present upstream as of 882c996
      vim.api.nvim_create_autocmd("User", {
        pattern = "VeryLazy",
        once = true,
        callback = function()
          local Placement = require("snacks.image.placement")
          local render = Placement._render
          Placement._render = function(self, extmarks)
            if self.hidden then
              for _, extmark in ipairs(extmarks) do
                extmark.conceal_lines = nil
              end
            end
            return render(self, extmarks)
          end
        end,
      })
      vim.filetype.add({
        pattern = {
          ["/home/jacob/Documents/Developer/parser%-ts%-files/.*"] = { "bigfile", { priority = 1000 } },
        },
      })
    end,
    opts = {
      explorer = { enabled = true },
      image = {
        enabled = true,
        -- diagrams replace their source block until the cursor enters it
        doc = {
          conceal = function(_, type)
            return type == "math" or type == "chart"
          end,
          -- the 80x40 default shrinks wide sequence diagrams until their text is unreadable
          max_width = 160,
          max_height = 60,
        },
      },
      picker = {
        sources = {
          explorer = {
            hidden = true,
            include = vim.list_extend(vim.deepcopy(ignored_file_globs), unignored_path_globs),
            exclude = { "**/.git", "**/.jj" },
          },
          files = {
            finder = "proc",
            cmd = "sh",
            args = { "-c", files_command },
            format = "file",
            show_empty = true,
            transform = function(item, ctx)
              item.file = item.text
              item.cwd = ctx.filter.cwd
            end,
          },
          grep = {
            hidden = true,
            exclude = { ".git", ".jj" },
          },
        },
      },
    },
  },
}
