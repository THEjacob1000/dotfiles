function fwd --argument-names port --description 'Forward a localhost port from the other machine: the PC from the Mac, the Mac from the PC'
    if test -z "$port"
        echo 'usage: fwd PORT' >&2
        return 2
    end
    set -l host jacob-pc-2
    if test (uname) = Linux
        set host jacob-mac
    end
    ssh -NL $port:127.0.0.1:$port $host
end
