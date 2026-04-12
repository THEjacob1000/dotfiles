function rmrec
    if test (count $argv) -eq 0
        echo "usage: rmrec <name>"
        return 1
    end

    set name $argv[1]

    find . -name "$name" -type d -prune -print -exec rm -rf {} +
end
