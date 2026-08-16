function fish_user_key_bindings
    fish_vi_key_bindings

    # keep the word-kill habits in insert mode (ctrl-h is ctrl-backspace here)
    bind -M insert ctrl-w backward-kill-word
    bind -M insert ctrl-h backward-kill-word
end
