# Resolve direnv once at shell startup, not on every prompt.
set -g __direnv_bin (command -s direnv)

function __direnv_export_eval --on-event fish_prompt
    if test -n "$__direnv_bin"
        "$__direnv_bin" export fish | source
    end

    if test "$direnv_fish_mode" != "disable_arrow"
        function __direnv_cd_hook --on-variable PWD
            if test "$direnv_fish_mode" = "eval_after_arrow"
                set -g __direnv_export_again 0
            else if test -n "$__direnv_bin"
                "$__direnv_bin" export fish | source
            end
        end
    end
end

function __direnv_export_eval_2 --on-event fish_preexec
    if set -q __direnv_export_again
        set -e __direnv_export_again

        if test -n "$__direnv_bin"
            "$__direnv_bin" export fish | source
            echo
        end
    end

    functions --erase __direnv_cd_hook
end
