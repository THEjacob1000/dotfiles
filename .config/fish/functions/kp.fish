function kp --description "Kill processes and Docker containers using one or more TCP ports"
    if test (count $argv) -eq 0
        echo "usage: kp <port> [port ...]"
        return 2
    end

    set -l all_pids
    set -l all_containers

    for port in $argv
        # Host processes
        set -l pids (sudo ss -ltnp "( sport = :$port )" \
            | string match -rg 'pid=([0-9]+)' \
            | string replace -r '^pid=' '')

        set all_pids $all_pids $pids

        # Docker containers
        set -l containers (docker ps -aq --filter publish=$port)
        set all_containers $all_containers $containers
    end

    # Deduplicate and kill processes
    if test (count $all_pids) -gt 0
        set all_pids (printf "%s\n" $all_pids | sort -u)
        echo "kp: killing PID(s): $all_pids"
        sudo kill -9 $all_pids
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
