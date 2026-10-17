# Open a local repo in a dedicated tmux window: Neovim on the left, a shell on the right
function o
    set -l base "$HOME/Documents/Developer"
    if test (count $argv) -eq 0
        ls -1 $base
        return
    end

    set -l dir $base/$argv[1]
    if not test -d $dir
        echo "o: no such repo: $argv[1]" >&2
        return 1
    end
    set -l name (basename $dir)

    if not set -q TMUX
        cd $dir; and nvim .
        return
    end

    # reuse the window if it's already open, otherwise make one.
    # Scope to the current session: a bare "=$name" also matches a *session*
    # of that name (this box runs session-per-repo) and would silently no-op.
    set -l session (tmux display-message -p '#S')
    tmux select-window -t "$session:=$name" 2>/dev/null; and return
    set -l win (tmux new-window -P -F '#{window_id}' -n $name -c $dir)
    # typed into a shell so quitting nvim leaves the pane open
    tmux send-keys -t $win 'nvim .' Enter
    tmux split-window -h -t $win -c $dir
end
