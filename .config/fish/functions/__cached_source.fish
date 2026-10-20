# Sources the init script a tool prints (e.g. `zoxide init fish`), regenerating it only when the binary changes.
function __cached_source -a tool
    set -l bin (path resolve (command -s $tool)); or return
    set -l dir (set -q XDG_CACHE_HOME; and echo $XDG_CACHE_HOME; or echo $HOME/.cache)/fish/init
    set -l cache $dir/$tool-(path mtime $bin).fish
    if not test -s $cache
        mkdir -p $dir
        rm -f $dir/$tool-*.fish
        if command $tool $argv[2..] >$cache.tmp 2>/dev/null </dev/null; and test -s $cache.tmp
            mv $cache.tmp $cache
        else
            rm -f $cache.tmp
        end
    end
    test -s $cache; and source $cache
end
