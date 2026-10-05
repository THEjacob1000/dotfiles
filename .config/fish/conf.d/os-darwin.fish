# macOS-only setup. Sourced before config.fish.
if test (uname) != Darwin
    exit
end

# Homebrew (Apple Silicon)
if test -d /opt/homebrew/bin
    fish_add_path /opt/homebrew/bin /opt/homebrew/sbin
end

# Docker Desktop and friends install here
fish_add_path /usr/local/bin
