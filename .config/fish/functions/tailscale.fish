function tailscale --wraps tailscale --description 'Run tailscale, via passwordless sudo on Linux'
    # the Linux daemon only lets root change settings; the macOS app's CLI talks to the app as the user
    if test (uname) = Linux
        sudo (command -s tailscale) $argv
    else
        command tailscale $argv
    end
end
