function clip --description 'Copy files, a command\'s output, or piped stdin to the clipboard'
    set -l copy xclip -selection clipboard
    command -q pbcopy; and set copy pbcopy
    if test (count $argv) -eq 0
        $copy
        return
    end
    if test -f $argv[1]; and not test -x $argv[1]
        cat $argv | $copy
        return $pipestatus[1]
    end
    $argv | $copy
    return $pipestatus[1]
end
