function cxacct --description 'pick the active cliproxyapi codex account'
    set -l d ~/.cli-proxy-api
    set -l off $d/off
    mkdir -p $off; or return 1

    # find, not globs: fish aborts the function on an unmatched wildcard
    set -l on (find $d -maxdepth 1 -type f -name 'codex-*.json'); or return 1
    set -l parked (find $off -maxdepth 1 -type f -name 'codex-*.json'); or return 1
    if test (count $on) -gt 0
        set on (path sort -- $on); or return 1
    end
    if test (count $parked) -gt 0
        set parked (path sort -- $parked); or return 1
    end

    if test -z "$argv[1]"
        echo active:
        for f in $on
            echo "  "(basename $f)
        end
        echo off:
        for f in $parked
            echo "  "(basename $f)
        end
        return
    end

    set -l hit
    set -l needle (string escape --style=regex $argv[1])
    for f in $on $parked
        if string match -q -r -- $needle (basename $f)
            set -a hit $f
        end
    end
    if test (count $hit) -ne 1
        echo "need exactly one match for '$argv[1]', got "(count $hit) >&2
        return 1
    end

    set -l name (basename $hit[1])
    if test -e $d/$name; or test -L $d/$name
        if test $hit[1] != $d/$name
            echo "refusing to overwrite $d/$name" >&2
            return 1
        end
    end

    set -l moved
    for f in $on
        set -l destination $off/(basename $f)
        # The proxy may refresh and recreate the parked copy; the active file wins.
        mv -fT -- $f $destination
        if test $status -ne 0; or test -e $f; or test -L $f; or not test -e $destination
            echo "failed to park "(basename $f) >&2
            for restore in $moved
                set -l source $off/(basename $restore)
                mv -nT -- $source $restore
                if test $status -ne 0; or test -e $source; or test -L $source; or not test -e $restore
                    echo "failed to restore "(basename $restore) >&2
                end
            end
            return 1
        end
        set -a moved $f
    end

    set -l source $off/$name
    set -l destination $d/$name
    mv -nT -- $source $destination
    if test $status -ne 0; or test -e $source; or test -L $source; or not test -e $destination
        echo "failed to activate $name; restoring previous active set" >&2
        set -l restore_failed 0
        for f in $moved
            set source $off/(basename $f)
            mv -nT -- $source $f
            if test $status -ne 0; or test -e $source; or test -L $source; or not test -e $f
                echo "failed to restore "(basename $f) >&2
                set restore_failed 1
            end
        end
        if test $restore_failed -eq 1
            echo "previous active set could not be fully restored" >&2
        end
        return 1
    end

    echo "active: $name"
end
