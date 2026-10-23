function omp --wraps omp --description 'Run omp inside the low-priority omp.slice'
    if not command -q systemd-run; or string match -q '*/omp.slice/*' </proc/self/cgroup
        command omp $argv
        return
    end
    systemd-run --user --scope --slice=omp.slice --quiet --same-dir -- (command -s omp) $argv
end
