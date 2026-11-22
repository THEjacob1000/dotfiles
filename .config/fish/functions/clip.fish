function clip --description "Copy files, a command's output, or piped stdin to the clipboard"
    set -l copy xclip -selection clipboard
    command -q pbcopy; and set copy pbcopy
    if test (count $argv) -eq 0
        $copy
        return
    end
    if test -f $argv[1]; and not test -x $argv[1]
        # xclip offers untyped data as text, which image targets ignore.
        set -l mime (file --mime-type -b $argv[1])
        if test (count $argv) -eq 1; and test $copy[1] = xclip; and string match -q 'image/*' $mime
            $copy -t $mime -i $argv[1]
            return
        end
        cat $argv | $copy
        return $pipestatus[1]
    end
    $argv | $copy
    return $pipestatus[1]
end
