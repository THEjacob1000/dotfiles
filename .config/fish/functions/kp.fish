function kp --description "Kill processes and Docker containers using one or more TCP ports"
    if test (count $argv) -eq 0
        echo "usage: kp <port> [port ...]"
        return 2
    end

    set -l all_pids
    set -l all_containers

    for port in $argv
        # Host processes
        set -l pids
        if type -q ss
            # Linux
            set pids (sudo ss -ltnp "( sport = :$port )" \
                | string match -rg 'pid=([0-9]+)' \
                | string replace -r '^pid=' '')
        else if type -q lsof
            # macOS
            set pids (lsof -tiTCP:$port)
        end

        set all_pids $all_pids $pids

        # Docker containers publishing this port
        set all_containers $all_containers (docker ps -aq --filter publish=$port)

        # Docker host-network containers listening on this port.
        # These bind inside the Docker VM, so lsof/publish-filter miss them.
        # ponytail: reads /proc/net/tcp (LISTEN state 0A, port in hex) — the
        # only universally-present probe. Add UDP if a UDP service ever needs it.
        set -l hexport (printf '%04X' $port)
        for c in (docker ps -q --filter network=host)
            if docker exec $c cat /proc/net/tcp /proc/net/tcp6 2>/dev/null \
                    | string match -rq ":$hexport [0-9A-F]+:[0-9A-F]+ 0A"
                set all_containers $all_containers $c
            end
        end
    end

    # Deduplicate and kill processes
    if test (count $all_pids) -gt 0
        set all_pids (printf "%s\n" $all_pids | sort -u)

        echo "kp: killing PID(s): $all_pids"

        if test (uname) = Darwin
            sudo kill -9 $all_pids
        else
            kill -9 $all_pids
        end
    end

    # Deduplicate and remove containers
    if test (count $all_containers) -gt 0
        set all_containers (printf "%s\n" $all_containers | sort -u)

        echo "kp: removing container(s):"
        for container in $all_containers
            docker ps -a --filter id=$container --format '  {{.Names}} ({{.ID}})'
        end

        docker rm -f $all_containers >/dev/null
    end

    if test (count $all_pids) -eq 0; and test (count $all_containers) -eq 0
        echo "kp: nothing using ports: $argv"
    end
end
