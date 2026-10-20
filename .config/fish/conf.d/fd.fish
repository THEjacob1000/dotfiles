if type -q fdfind; and not type -q fd
    function fd --wraps="fdfind" --description "alias fd=fdfind"; fdfind $argv; end
end
