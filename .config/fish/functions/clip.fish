function clip --description 'Copy a command\'s output (or piped stdin) to the clipboard'
    if test (count $argv) -eq 0
        xclip -selection clipboard
        return
    end
    $argv | xclip -selection clipboard
    return $pipestatus[1]
end
