function fish_title
    if set -q TMUX
        # sessions are rarely renamed, so ask tmux once per shell instead of every prompt
        set -q __fish_title_session; or set -g __fish_title_session (tmux display-message -p '#S')
        echo $__fish_title_session
    else
        prompt_pwd --full-length 1
    end
end
