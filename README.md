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
