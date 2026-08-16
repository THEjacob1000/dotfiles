# Open a local repo in a dedicated tmux window running Neovim
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

    # reuse the window if it's already open, otherwise make one
    tmux select-window -t "=$name" 2>/dev/null; or tmux new-window -n $name -c $dir nvim .
end
