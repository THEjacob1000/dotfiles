function tailscale --wraps tailscale --description 'Run tailscale as root via passwordless sudo'
    sudo /usr/bin/tailscale $argv
end
