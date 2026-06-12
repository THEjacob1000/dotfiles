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
- `.config/zed/` — Zed editor configuration

## Restore on a new machine

```bash
# 1. Install GNU Stow
sudo apt install stow        # Debian/Ubuntu/Mint
# sudo dnf install stow      # Fedora
# sudo pacman -S stow        # Arch
# brew install stow          # macOS

# 2. Clone this repo
git clone <your-repo-url> ~/.dotfiles

# 3. Create symlinks
cd ~/.dotfiles
stow .
```

That's it. All dotfiles will be symlinked to their correct locations in `~`.

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
