# Global detach-on-destroy is off, so without this exiting the last pair shell drops the client into main.
set -g _pair_new "new-session -A -s pair \; set-option detach-on-destroy on"

function pair --description 'Start or join the shared tmux pairing session'
    eval tmux $_pair_new
end

function pair-allow --description 'Let a GitHub user ssh straight into the pair session (--ro to watch only)'
    argparse ro -- $argv; or return
    if test (count $argv) -ne 1
        echo "usage: pair-allow [--ro] <github-user>" >&2
        return 1
    end

    set -l user $argv[1]
    set -l keys (curl -fsSL "https://github.com/$user.keys"); or return
    if test (count $keys) -eq 0
        echo "pair-allow: $user has no public keys on GitHub" >&2
        return 1
    end

    # Non-interactive ssh has no mise shims on PATH, so pin the real binary.
    set -l tmux_cmd (command -s tmux)" $_pair_new"
    set -q _flag_ro; and set tmux_cmd (command -s tmux)" attach -r -t pair \; set-option detach-on-destroy on"

    pair-revoke $user 2>/dev/null
    for key in $keys
        echo "command=\"$tmux_cmd\",restrict,pty $key pair:$user" >>~/.ssh/authorized_keys
    end
    echo "$user can now run: ssh $USER@"(pair-host)
end

function pair-revoke --description 'Remove a user added with pair-allow'
    if test (count $argv) -ne 1
        echo "usage: pair-revoke <github-user>" >&2
        return 1
    end

    set -l kept (string match -v -- "* pair:$argv[1]" <~/.ssh/authorized_keys)
    printf '%s\n' $kept >~/.ssh/authorized_keys
end

function pair-ls --description 'List users added with pair-allow'
    string match -r -g -- ' pair:(\S+)$' <~/.ssh/authorized_keys | sort -u
end

function pair-host --description "This machine's tailnet hostname"
    /usr/bin/tailscale status --json | jq -r '.Self.DNSName | rtrimstr(".")'
end
