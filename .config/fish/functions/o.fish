# Open a local GitHub repo folder in Zed
# Mirrors your zsh `o()` but in fish
function o
    set base "$HOME/Documents/Developer"
    if test (count $argv) -gt 0
        zed $base/$argv
    else
        ls -1 $base
    end
end
