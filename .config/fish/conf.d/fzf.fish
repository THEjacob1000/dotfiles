type -q fzf; or return

if type -q fd
    set -gx FZF_DEFAULT_COMMAND "fd --type f --type d --strip-cwd-prefix --"
else
    set -gx FZF_DEFAULT_COMMAND "find . -type f -o -type d"
end

set -gx FZF_DEFAULT_OPTS "--height 80% --style=minimal --ansi --border=sharp --color=16 --cycle \
--bind 'ctrl-e:preview-down,ctrl-y:preview-up,ctrl-d:preview-half-page-down,ctrl-u:preview-half-page-up,ctrl-f:preview-page-down,ctrl-b:preview-page-up,ctrl-g:jump,jump:accept,jump-cancel:'"

set -gx FZF_CTRL_T_COMMAND $FZF_DEFAULT_COMMAND
# fzf runs preview/transform under $SHELL, so these are fish syntax. Enter opens files in nvim; directories still insert their path.
set -gx FZF_CTRL_T_OPTS "--select-1 \
--preview 'if test -d {}; ls -la --color=always {}; else; head -200 {}; end' \
--bind 'enter:transform:test -d {}; and echo accept; or echo \"execute(nvim {})+abort\"'"
