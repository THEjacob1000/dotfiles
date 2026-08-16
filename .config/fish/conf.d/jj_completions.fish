# Dynamic completions for jj — fills gaps in the generated jj.fish
# Covers: bookmark names (reuses __jj_bookmarks from jj_aliases.fish),
#         remote names, operation IDs, workspace names.
# Note: jj_aliases.fish (alphabetically earlier) defines __jj_bookmarks already.

function __jj_remote_names
    jj git remote list 2>/dev/null | string replace -r '\s.*' ''
end

function __jj_op_ids
    jj op log --no-pager --template 'id.short() ++ "\t" ++ description.first_line() ++ "\n"' 2>/dev/null
end

function __jj_workspace_names
    jj workspace list 2>/dev/null | string replace -r ':.*' ''
end

# bookmark delete / forget / move / rename / set — take existing bookmark names
# (reuses __jj_bookmarks defined in jj_aliases.fish)
for __jj_subcmd in delete d forget f move m rename r set s
    complete -c jj -n "__fish_jj_using_subcommand bookmark; and __fish_seen_subcommand_from $__jj_subcmd" \
        -f -a "(__jj_bookmarks)"
end

# git fetch / push / pull — --remote <name>
for __jj_subcmd in fetch push pull
    complete -c jj -n "__fish_jj_using_subcommand git; and __fish_seen_subcommand_from $__jj_subcmd" \
        -l remote -r -f -a "(__jj_remote_names)"
end

# git remote remove / rename — positional remote name
for __jj_subcmd in remove rename
    complete -c jj -n "__fish_jj_using_subcommand git; and __fish_seen_subcommand_from remote; and __fish_seen_subcommand_from $__jj_subcmd" \
        -f -a "(__jj_remote_names)"
end

# op restore / show / diff / abandon — positional operation ID
for __jj_subcmd in restore show diff abandon
    complete -c jj -n "__fish_jj_using_subcommand op; and __fish_seen_subcommand_from $__jj_subcmd" \
        -f -a "(__jj_op_ids)"
end

# workspace forget — positional workspace name
complete -c jj -n "__fish_jj_using_subcommand workspace; and __fish_seen_subcommand_from forget" \
    -f -a "(__jj_workspace_names)"

set --erase __jj_subcmd
