# Helpers for driving the Linux box from macOS. Linux side has no use for them.
if test (uname) != Darwin
    exit
end


# Host can be overridden per-session: set -gx LINUX_HOST other-box
set -q LINUX_HOST; or set -gx LINUX_HOST jacob-pc-2

function lx --description 'Run a bash command on $LINUX_HOST (command sent over stdin — no quoting hell)'
    printf '%s\n' "$argv" | ssh $LINUX_HOST bash
end

function lxt --description 'Run an interactive/TTY command on $LINUX_HOST'
    ssh -t $LINUX_HOST $argv
end

function lxcp --description 'Copy file(s) to $LINUX_HOST; last arg = $HOME-relative dest'
    set -l dest $argv[-1]
    set -l srcs $argv[1..-2]
    scp $srcs $LINUX_HOST:$dest
end

function lxps --description 'Show running nix build/copy jobs on $LINUX_HOST'
    lx 'pgrep -af "nix build|nix copy" | grep -v tailscale'
end

function lxterm --description 'Open a GUI terminal on $LINUX_HOST own display (pass gnome-terminal args)'
    lx "export DISPLAY=:0 XDG_RUNTIME_DIR=/run/user/1000 \
        DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus; \
        nohup gnome-terminal $argv >/dev/null 2>&1 &"
end
