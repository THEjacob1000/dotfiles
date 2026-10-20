# ~/.config/fish/conf.d/cargo_aliases.fish
#
# Ported from mrdwarf7/dotfiles (linux branch). `cr` is left alone: it's coderabbit here.

function cb --wraps="cargo build" --description "alias cb cargo build"; cargo build $argv; end
function cbr --wraps="cargo build --release" --description "alias cbr cargo build --release"; cargo build --release $argv; end
function cba --wraps="cargo build; and cargo build --release" --description "alias cba cargo build; and cargo build --release"; cargo build; and cargo build --release $argv; end
function crq --wraps="cargo run -q" --description "alias crq cargo run -q"; cargo run -q $argv; end
function crr --wraps="cargo run --release" --description "alias crr cargo run --release"; cargo run --release $argv; end
function cch --wraps="cargo check" --description "alias cch cargo check"; cargo check $argv; end
function ccl --wraps="cargo clean" --description "alias ccl cargo clean"; cargo clean $argv; end
function cu --wraps="cargo update" --description "alias cu cargo update"; cargo update $argv; end
function cdoc --wraps="cargo doc" --description "alias cdoc cargo doc"; cargo doc $argv; end
function ct --wraps="cargo test" --description "alias ct cargo test"; cargo test $argv; end
function ctq --wraps="cargo test --quiet" --description "alias ctq cargo test --quiet"; cargo test --quiet $argv; end
function cta --wraps="cargo test --all" --description "alias cta cargo test --all"; cargo test --all $argv; end
function ctaq --wraps="cargo test --all --quiet" --description "alias ctaq cargo test --all --quiet"; cargo test --all --quiet $argv; end
function cw --wraps="cargo watch" --description "alias cw cargo watch"; cargo watch $argv; end
function cwq --wraps="cargo watch -q" --description "alias cwq cargo watch -q"; cargo watch -q $argv; end
function cwqc --wraps="cargo watch -q -c" --description "alias cwqc cargo watch -q -c"; cargo watch -q -c $argv; end
function cwqcr --wraps="cargo watch -q -c -x run" --description "alias cwqcr cargo watch -q -c -x run"; cargo watch -q -c -x run $argv; end
function ma --wraps="cargo make" --description "alias ma cargo make"; cargo make $argv; end
