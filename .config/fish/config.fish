# The following lines were added by Docker Desktop to add commands to your PATH.
export PATH="$PATH:/Users/jacob/.docker/bin"
# End of Docker Desktop section.

# Only run interactively
if not status is-interactive
    exit
end

# OS-specific setup lives in conf.d/os-linux.fish and conf.d/os-darwin.fish,
# which fish sources before this file.

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

# Shorebird
if test -d $HOME/.shorebird/bin
    fish_add_path $HOME/.shorebird/bin
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

# direnv's IN_NIX_SHELL survives `exec fish`; stripping then loses mise-only tools like zoxide and tmux.
# Outside nix, `mise activate` scopes PATH per project; global shims would expose every pinned tool everywhere.
if set -q IN_NIX_SHELL
    if not set -q DIRENV_DIR
        __remove_mise_paths
    else if test -d $HOME/.local/share/mise/shims
        fish_add_path -g $HOME/.local/share/mise/shims
    end
end

# Completions for tools that print their own fish script live in conf.d/tool-completions.fish.

# -----------------------------
# Aliases (fish 3.x `alias` is built-in)
# -----------------------------

# General
function py --wraps="python3" --description "alias py=python3"; python3 $argv; end
function tf --wraps="terraform" --description "alias tf=terraform"; terraform $argv; end
function cf-tf --wraps="cf-terraforming" --description "alias cf-tf=cf-terraforming"; cf-terraforming $argv; end
function bazel --wraps="bazelisk" --description "alias bazel bazelisk"; bazelisk $argv; end
function ef --wraps="exec fish" --description "alias ef=exec fish"; exec fish $argv; end
function ff --wraps="fastfetch" --description "alias ff=fastfetch"; fastfetch $argv; end

# loke built from source, for when the mise-managed one is not what you want
function loke-debug --wraps="$HOME/Documents/Developer/loke-cli/loke" --description "alias loke-debug=$HOME/Documents/Developer/loke-cli/loke"; $HOME/Documents/Developer/loke-cli/loke $argv; end

# Git SSH commit signing: configured once via:
#   git config --global gpg.format ssh
#   git config --global commit.gpgsign true
#   git config --global user.signingkey ~/.ssh/id_ed25519.pub

# -----------------------------
# Global Vars
# -----------------------------

set -gx EDITOR nvim
set -gx VISUAL nvim
set -gx OMX_TEAM_WORKER_LAUNCH_ARGS "--approval-policy auto"

# -----------------------------
# Quality-of-life
# -----------------------------

# Quiet greeting
set -g fish_greeting

# key bindings live in functions/fish_user_key_bindings.fish (vi mode)

# GUI terminals can inherit TMUX while setting their own TERM; do not nest tmux.
if status is-interactive; and not set -q TMUX; and not string match -q "screen*" $TERM; and not string match -q "tmux*" $TERM
    set -l session_name (if test "$PWD" = "$HOME"; echo main; else; basename $PWD; end)
    exec tmux new-session -A -s $session_name
end

# opencode
fish_add_path $HOME/.opencode/bin
__cached_source zoxide init fish
