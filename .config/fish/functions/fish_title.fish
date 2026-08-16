function fish_title
    if set -q TMUX
        tmux display-message -p '#S'
    else
        prompt_pwd --full-length 1
    end
end
