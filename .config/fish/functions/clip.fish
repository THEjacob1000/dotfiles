function clip --description 'Copy files, a command\'s output, or piped stdin to the clipboard'
    if test (count $argv) -eq 0
        xclip -selection clipboard
        return
    end
    if test -f $argv[1]; and not test -x $argv[1]
        xclip -selection clipboard $argv
        return
    end
    $argv | xclip -selection clipboard
    return $pipestatus[1]
end
