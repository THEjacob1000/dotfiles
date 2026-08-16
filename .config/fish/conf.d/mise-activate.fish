# nix shells manage their own toolchain; mise would shadow it.
if set -q IN_NIX_SHELL
    exit
end

# mise lands in ~/.local/bin on Linux, /opt/homebrew/bin on macOS.
for __mise_bin in $HOME/.local/bin/mise /opt/homebrew/bin/mise
    if test -x $__mise_bin
        $__mise_bin activate fish | source
        break
    end
end
set --erase __mise_bin
