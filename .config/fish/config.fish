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

# mise: vendor conf.d auto-activates mise (mise-activate.fish).
# Only add shims path here.
if test -d $HOME/.local/share/mise/shims
    fish_add_path $HOME/.local/share/mise/shims
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
# Quality-of-life
# -----------------------------

# Quiet greeting
set -g fish_greeting

if status is-interactive; and not string match -q "screen*" $TERM; and not string match -q "tmux*" $TERM
    set -l session_name (if test "$PWD" = "$HOME"; echo main; else; basename $PWD; end)
    exec tmux new-session -A -s $session_name
end
