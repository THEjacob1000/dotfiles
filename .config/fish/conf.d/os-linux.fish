# Linux-only setup. Sourced before config.fish.
if test (uname) != Linux
    exit
end

if test -d /opt/nvim-linux-x86_64/bin
    fish_add_path /opt/nvim-linux-x86_64/bin
end

# gnome-keyring provides the ssh agent
set -gx SSH_AUTH_SOCK "$XDG_RUNTIME_DIR/gcr/ssh"
set -gx GSM_SKIP_SSH_AGENT_WORKAROUND true

# systemd-launched tmux has no DISPLAY, so GUI apps started from a shell run headless
if not set -q DISPLAY; and not set -q WAYLAND_DISPLAY
    set -l d (loginctl show-session (loginctl show-user $USER -p Display --value) -p Display --value 2>/dev/null)
    test -n "$d"; and set -gx DISPLAY $d
end
