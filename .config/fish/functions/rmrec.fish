function rmrec --description 'Recursively remove directories matching any supplied name'
    if test (count $argv) -eq 0
        echo "usage: rmrec <name> [name ...]" >&2
        return 1
    end

    set -l escaped_names (string escape --style=regex -- $argv)
    set -l pattern '^(?:'(string join '|' $escaped_names)')$'

    fd \
        --hidden \
        --no-ignore \
        --one-file-system \
        --type directory \
        --print0 \
        -- "$pattern" . \
    | xargs -0 -r -P 8 rm -rf --
end
