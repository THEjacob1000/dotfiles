# ~/.config/fish/conf.d/cargo_aliases.fish
#
# Ported from mrdwarf7/dotfiles (linux branch). `cr` is left alone: it's coderabbit here.

alias cb "cargo build"
alias cbr "cargo build --release"
alias cba "cargo build; and cargo build --release"
alias crq "cargo run -q"
alias crr "cargo run --release"
alias cch "cargo check"
alias ccl "cargo clean"
alias cu "cargo update"
alias cdoc "cargo doc"
alias ct "cargo test"
alias ctq "cargo test --quiet"
alias cta "cargo test --all"
alias ctaq "cargo test --all --quiet"
alias cw "cargo watch"
alias cwq "cargo watch -q"
alias cwqc "cargo watch -q -c"
alias cwqcr "cargo watch -q -c -x run"
alias ma "cargo make"
