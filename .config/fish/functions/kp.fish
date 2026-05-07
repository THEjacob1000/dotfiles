function kp --description "Kill processes listening on a TCP port"
    if test (count $argv) -ne 1
        echo "usage: kp <port>"
        return 2
    end

    set port $argv[1]

    if not string match -qr '^[0-9]+$' -- $port
        echo "kp: port must be a number"
        return 2
    end

    set pids (lsof -tiTCP:$port -sTCP:LISTEN)

    if test (count $pids) -eq 0
        echo "kp: nothing listening on port $port"
        return 0
    end

    echo "kp: killing PID(s) on port $port: $pids"
    kill -9 $pids
end
