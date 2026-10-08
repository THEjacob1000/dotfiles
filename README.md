# dotfiles

Managed with [GNU Stow](https://www.gnu.org/software/stow/).

## Contents

- `.gitconfig` — Git identity & settings
- `.gitignore_global` — Global gitignore patterns
- `.tmux.conf` — tmux configuration
- `.config/ccstatusline/` — Claude Code statusline configuration
- `.config/fish/` — Fish shell configuration
- `.config/gh/` — GitHub CLI configuration
- `.config/jj/` — Jujutsu VCS configuration
- `.config/mise/` — mise version manager configuration
- `.config/nvim/` — LazyVim (Neovim) configuration
- `.config/zed/` — Zed editor configuration
- `.kiro/agents/` and `.kiro/settings/cli.json` — Kiro CLI agents and global defaults
- `.kiro/crew/workspace/` — KiroCrew workspace skeleton (AGENTS.md, settings)

Works on Linux and macOS from the same tree — see [Cross-platform](#cross-platform).

## Restore on a new machine

```bash
# 1. Install GNU Stow
sudo apt install stow        # Debian/Ubuntu/Mint
# sudo dnf install stow      # Fedora
# sudo pacman -S stow        # Arch
# brew install stow          # macOS

# 2. Clone this repo
git clone git@github.com:THEjacob1000/dotfiles.git ~/.dotfiles

# 3. Create symlinks
cd ~/.dotfiles
stow .

# 4. Machine-local git settings (signing key is per-machine, so not tracked)
cat > ~/.gitconfig.local <<'EOF'
[user]
	signingkey = ~/.ssh/id_ed25519.pub
EOF
```

That's it. All dotfiles will be symlinked to their correct locations in `~`.

Stow refuses to overwrite existing real files, so move anything already in place
out of the way first (`mv ~/.gitconfig ~/.gitconfig.bak`) and re-run `stow .`.

## Zed Vim workflow

`~/.config/zed/settings.json` and `keymap.json` mirror the practical editing
keys from the local Neovim config and installed LazyVim defaults. Space is the
leader. Existing themes, panels, collaboration, agent and language/formatter
settings are unchanged.

| Keys | Action |
|---|---|
| `Ctrl-P`, `Space Space`, `Space ff` | Find files |
| `Space e`, `Space E`, `Space fe` | Focus/toggle the project explorer |
| `Space sg`, `Space /` | Project grep with an empty query |
| `Space sw` | Search the word under the cursor or visual selection |
| ``Ctrl-` `` | Toggle Zed's terminal panel (native shortcut, not Neovim's terminal ban) |
| `gd`, `gI`, `gy`, `K` | Definition, implementation, type definition, hover (native Zed Vim) |
| `gr`, `Space ca`, `Space cr`, `Space cf` | References, code actions, rename, format |
| `Ctrl-H/J/K/L`, `Ctrl-W h/j/k/l` | Navigate splits |
| `Ctrl-W s/v`, `Space -`, `Space \|` | Horizontal/vertical split |
| `Space wd`, `Space wm` | Close the active split item / toggle zoom |
| `H/L`, `[b` / `]b` | Previous/next tab |
| `Space bb`, `Space` followed by backtick | Alternate file |
| `Space ,`, `Space fb` | Open tab switcher |
| `Space bd`, `Space qq` | Close the current file in all panes / close the workspace window |
| `Ctrl-S`, `:w` | Save using existing format-on-save policy |
| `Space yp`, `Space yP` | Copy workspace-relative / absolute file path |
| `x`, `dd`, visual `x` | Delete without replacing the system clipboard |
| Visual `p` | Paste without yanking the replaced selection |

Normal Vim `/`, `?`, `n/N`, `*`/`#`, `g*`/`g#`, folds and `Ctrl-W` commands
remain native. Clipboard integration is explicit (`always`, like
`unnamedplus`), with relative line numbers and four lines of scroll context.
The old `Ctrl-W` close and `Ctrl-J` dock toggle remain available in insert,
replace and non-Vim editors, not normal/visual Vim.

This is not a plugin emulation layer: explorer root/cwd variants both use
Zed's workspace tree, buffer pickers use Zed's tab switcher, and grep uses
Zed's project search rather than Snacks. Existing Zed ignore rules and search
options still apply. Visual `Space cf` formats the selection; normal mode
formats the buffer. Save does not force an exit from insert mode. Neovim's preview,
undotree, custom window-move menus and jj/tmux integrations have no substitute
bindings here; no unrelated Git action is advertised as jj parity.

Zed 1.23.2 has a macro-recording limitation: these `SendKeystrokes` delete
remaps can record both the wrapper and generated deletion, so replay can
delete twice. Do not record mapped `x`/`dd` in macros. Use native blackhole
commands instead: `"_` followed by the Delete key for a character, `"_d_`
for a line, or `"_d` for a visual selection. Ordinary mapped deletes retain
counts and dot-repeat; verify these and clipboard preservation in the GUI
when upgrading Zed.

## Cross-platform

One tree serves both machines. Three mechanisms handle the differences:

- **fish** — `conf.d/os-linux.fish` and `conf.d/os-darwin.fish` each bail out
  immediately on the wrong OS. Homebrew paths, `SSH_AUTH_SOCK`, `TMUX_TMPDIR`
  and the `DISPLAY` fixup live there, not in `config.fish`.
- **git** — `.gitconfig` ends with `[include] path = ~/.gitconfig.local`, which
  is untracked and holds the per-machine signing key and CodeRabbit machine ID.
- **tmux** — `if-shell` sets `@copy_cmd`/`@paste_cmd` to `pbcopy`/`pbpaste` on
  macOS and `xclip` on X11; the copy-mode binds reference those.

- **ghostty** — `config` ends with `config-file = ?config.local`, an optional
  untracked file holding the shell path and font sizing (DPI differs per screen).

mise tools that only make sense on one OS use its `os` filter, e.g.
`cocoapods = { version = "latest", os = ["macos"] }`.

### Untracked per-machine files

Not in git; recreate on each machine:

| File | Holds |
|---|---|
| `~/.gitconfig.local` | commit signing key, CodeRabbit machine ID |
| `~/.config/ghostty/config.local` | `command`, `font-family`, `font-size` |
| `~/.config/direnv/direnv.toml` | `bash_path` (macOS needs Homebrew bash) |
| `~/.config/gh/` | OAuth tokens |
| `~/.config/graphite/user_config` | auth token |

Everything else is written to be path-agnostic — `~` or `$HOME`, never
`/home/jacob`. Keep it that way when adding files.

## Staying in sync

```bash
cd ~/.dotfiles && jj git fetch && jj rebase -d main@origin   # or: git pull
```

Symlinks mean a pull updates the live config immediately; restart fish/tmux to
pick up shell changes.

## Adding new dotfiles

```bash
# Move the file/dir into ~/.dotfiles, preserving path relative to ~
mv ~/.config/foo ~/.dotfiles/.config/foo

# Re-run stow
cd ~/.dotfiles && stow .
```

## Structure

Files in `~/.dotfiles` mirror the path structure of `~`. Stow symlinks each
entry from `~/.dotfiles` back to `~`, so `~/.dotfiles/.gitconfig` becomes
`~/.gitconfig`, and `~/.dotfiles/.config/fish` becomes `~/.config/fish`.
