local ignored_file_globs = {
  ".env",
  ".env.*",
  "*.local",
  "*.local.*",
  "google-services.json",
  "GoogleService-Info.plist",
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
      -- with extended-keys on, snacks reads tmux's client_termname (xterm-256color) and misses Ghostty.
      -- A client whose termtype is tmux is the Mac's tmux carrying an ssh session; every terminal
      -- here is Ghostty, so treat that as Ghostty too
      local clients = vim.env.TMUX
          and vim.fn.system({ "tmux", "list-clients", "-t", vim.env.TMUX_PANE or "", "-F", "#{client_termtype}" })
        or ""
      if clients:find("ghostty") or clients:find("tmux") then
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

          if not vim.env.TMUX then
            return
          end
          local terminal = require("snacks.image.terminal")
          -- the outer terminal may be on the other end of ssh, so send image bytes, never a local path
          local env = terminal.env
          terminal.env = function()
            return vim.tbl_extend("force", env(), { remote = true })
          end
          -- snacks wraps graphics for one tmux; a nested tmux over ssh needs a second wrap. Send both,
          -- and each terminal ignores the copy meant for the other. The nested copies wait until a
          -- chunked upload finishes, since Ghostty drops an upload that is interrupted mid-way
          local write = terminal.write
          local nested = {} ---@type string[]
          terminal.write = function(data)
            write(data)
            local control = data:match("^\27_G([^;\27]*)")
            if not control then
              return
            end
            nested[#nested + 1] = ("\27Ptmux;" .. data:gsub("\27", "\27\27")) .. "\27\\"
            if not ("," .. control .. ","):find(",m=1,") then
              for _, copy in ipairs(nested) do
                write(copy)
              end
              nested = {}
            end
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
        convert = {
          -- snacks renders at the terminal's reported scale, which is 1 behind tmux or ssh even on a
          -- retina screen, so text in big diagrams was upscaled mush; 3x gives the terminal pixels to spare
          mermaid = function()
            local theme = vim.o.background == "light" and "neutral" or "dark"
            return { "-i", "{src}", "-o", "{file}", "-b", "transparent", "-t", theme, "-s", "3" }
          end,
        },
      },
      picker = {
        sources = {
          explorer = {
            hidden = true,
            ignored = true,
            exclude = {
              "**/.git",
              "**/.jj",
              "**/node_modules",
              "**/dist",
              "**/target",
              "**/.direnv",
              "**/.devenv",
              "**/__pycache__",
              "**/*.tsbuildinfo",
              "**/.next",
              "**/.output",
              "**/.tanstack",
              "**/coverage",
            },
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
