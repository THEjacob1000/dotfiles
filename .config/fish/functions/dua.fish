function dua --wraps dua
    # APFS clones only exist on macOS, so the flag is pointless (or unknown) elsewhere.
    if test (uname) = Darwin
        command dua --deduplicate-apfs-clones $argv
    else
        command dua $argv
    end
end
