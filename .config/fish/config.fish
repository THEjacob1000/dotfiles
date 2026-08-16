# Only run interactively
if not status is-interactive
    exit
end

# -----------------------------
# PATHs & package managers
# -----------------------------

fish_add_path $HOME/.local/bin

# Bun
if test -d $HOME/.bun/bin
    fish_add_path $HOME/.bun/bin
end

# Bun debug build
if test -d $HOME/Documents/Developer/bun/build/debug
    fish_add_path $HOME/Documents/Developer/bun/build/debug
end

# Cargo (Rust)
if test -d $HOME/.cargo/bin
    fish_add_path $HOME/.cargo/bin
end

# Go
if test -d $HOME/go/bin
    fish_add_path $HOME/go/bin
end

# Dart
if test -d $HOME/.pub-cache/bin
    fish_add_path $HOME/.pub-cache/bin
end

function __remove_mise_paths --description 'Remove all mise-managed paths from PATH'
    set -l cleaned_path
    for p in $PATH
        if not string match -qr '^'"$HOME"'/.local/share/mise/(shims|installs)(/|$)' -- $p
            set cleaned_path $cleaned_path $p
        end
    end
    set -gx PATH $cleaned_path
end

if set -q IN_NIX_SHELL
    __remove_mise_paths
else
    if test -d $HOME/.local/share/mise/shims
        fish_add_path $HOME/.local/share/mise/shims
    end
end

# gh and jj completions are cached as static files in ~/.config/fish/completions/
# Regenerate with:
#   gh completion -s fish > ~/.config/fish/completions/gh.fish
#   jj util completion fish > ~/.config/fish/completions/jj.fish

# -----------------------------
# Aliases (fish 3.x `alias` is built-in)
# -----------------------------

# General
alias py="python3"
alias tf="terraform"
alias cf-tf="cf-terraforming"
alias bazel bazelisk

# Git SSH commit signing: configured once via:
#   git config --global gpg.format ssh
#   git config --global commit.gpgsign true
#   git config --global user.signingkey ~/.ssh/id_ed25519.pub


# -----------------------------
# Global Vars
# -----------------------------

set -gx EDITOR nvim
set -gx VISUAL nvim
set -gx SSH_AUTH_SOCK "$XDG_RUNTIME_DIR/gcr/ssh"
# one tmux socket for every shell (desktop, ssh, systemd) or sessions split in two
set -gx TMUX_TMPDIR /run/user/1000
set -gx GSM_SKIP_SSH_AGENT_WORKAROUND true
# systemd-launched tmux has no DISPLAY, so GUI apps started from a shell run headless
if not set -q DISPLAY; and not set -q WAYLAND_DISPLAY
    set -l d (loginctl show-session (loginctl show-user $USER -p Display --value) -p Display --value 2>/dev/null)
    test -n "$d"; and set -gx DISPLAY $d
end
set -gx OMX_TEAM_WORKER_LAUNCH_ARGS "--approval-policy auto"


# -----------------------------
# Quality-of-life
# -----------------------------

# Quiet greeting
set -g fish_greeting

# key bindings live in functions/fish_user_key_bindings.fish (vi mode)

if status is-interactive; and not string match -q "screen*" $TERM; and not string match -q "tmux*" $TERM
    set -l session_name (if test "$PWD" = "$HOME"; echo main; else; basename $PWD; end)
    exec tmux new-session -A -s $session_name
end

export PATH="$PATH:/opt/nvim-linux-x86_64/bin"
