# ~/.config/fish/conf.d/jj_aliases.fish
#
# Completions for jj bookmark aliases (jb, jbm, jbd, jbl, jbr, jbs, jbt, jbf, jbc).
# Must live in conf.d/ (not completions/) because completions/ files are keyed
# to a single command name — this file covers many commands at once.

# ---------------------------------------------------------
# Aliases
# ---------------------------------------------------------
alias j="jj"
alias ja="jj abandon"
alias jb="jj bookmark"
alias jbm="jj bookmark move"
alias jbd="jj bookmark d"
alias jbl="jj bookmark list"
alias jbr="jj bookmark rename"
alias jbs="jj bookmark set"
alias jbt="jj bookmark track --remote=origin"
alias jbf="jj bookmark forget"
alias jc="jj commit"
alias jcmsg="jj commit --message"
alias jd="jj diff"
alias jdmsg="jj desc --message"
alias jds="jj desc"
alias je="jj edit"
alias jgcl="jj git clone"
alias jgf="jj git fetch"
alias jgp="jj git push"
alias jgpa="jj git push --all"
alias jl="jj log"
alias jn="jj new"
alias jrb="jj rebase"
alias jrbt="jj git fetch; and jj rebase -b @ -d 'trunk()'"
alias jrs="jj restore"
alias jrt='cd "(jj root || echo .)"'
alias js="jj squash"
alias jsp="jj split"
alias jsps="jj split --siblings"
alias jst="jj st"
alias jsto="jj squash --into"
alias jnt="jj git fetch; and jj new 'trunk()'"
alias jmm="jj new @ 'trunk()'; and jj commit -m 'Merge in master'"
alias jcp="jj commit; and jj git push --all"

# ---------------------------------------------------------
# Helper: list local bookmark names
# ---------------------------------------------------------
function __jj_bookmarks
    jj bookmark list 2>/dev/null | string match -r '^[^:@ \t]+'
end

# Helper: list bookmarks including remote-only at origin
function __jj_origin_bookmarks
    jj bookmark list --all-remotes 2>/dev/null \
        | string replace -r '@origin.*' '' \
        | string match -r '^[^:@ \t]+'
end

# jd = jj diff: -f/--from takes a revision/bookmark, not a path.
complete -c jd -s f -l from -d 'Show changes from this revision' -r -f -a "(__jj_bookmarks)"

# ---------------------------------------------------------
# jb = jj bookmark → subcommands
# ---------------------------------------------------------
complete -c jb -f -a advance  -d 'Advance the closest bookmarks to a target revision'
complete -c jb -f -a create   -d 'Create a new bookmark'
complete -c jb -f -a delete   -d 'Delete an existing bookmark'
complete -c jb -f -a forget   -d 'Forget a bookmark (no remote deletion)'
complete -c jb -f -a list     -d 'List bookmarks and their targets'
complete -c jb -f -a move     -d 'Move existing bookmarks to target revision'
complete -c jb -f -a rename   -d 'Rename a bookmark'
complete -c jb -f -a set      -d 'Create or update a bookmark'
complete -c jb -f -a track    -d 'Start tracking a remote bookmark'
complete -c jb -f -a untrack  -d 'Stop tracking a remote bookmark'

# ---------------------------------------------------------
# jbm = jj bookmark move
# ---------------------------------------------------------
complete -c jbm -f -a "(__jj_bookmarks)"
complete -c jbm -s f -l from            -d 'Move bookmarks from given revisions' -r
complete -c jbm -s t -l to              -d 'Move bookmarks to this revision' -r
complete -c jbm -s B -l allow-backwards -d 'Allow moving bookmarks backwards or sideways'

# ---------------------------------------------------------
# jbd = jj bookmark delete
# ---------------------------------------------------------
complete -c jbd -f -a "(__jj_bookmarks)"

# ---------------------------------------------------------
# jbr = jj bookmark rename
# ---------------------------------------------------------
complete -c jbr -f -a "(__jj_bookmarks)"
complete -c jbr -l overwrite-existing -d 'Allow renaming even if the new name already exists'

# ---------------------------------------------------------
# jbs = jj bookmark set
# ---------------------------------------------------------
complete -c jbs -f -a "(__jj_bookmarks)"
complete -c jbs -s r -l revision        -d 'Target revision' -r
complete -c jbs -s B -l allow-backwards -d 'Allow moving bookmark backwards or sideways'

# ---------------------------------------------------------
# jbt = jj bookmark track --remote=origin
# ---------------------------------------------------------
complete -c jbt -f -a "(__jj_origin_bookmarks)"

# ---------------------------------------------------------
# jbf = jj bookmark forget
# ---------------------------------------------------------
complete -c jbf -f -a "(__jj_bookmarks)"
complete -c jbf -l include-remotes -d 'Also forget corresponding remote bookmarks'

# ---------------------------------------------------------
# jbl = jj bookmark list
# ---------------------------------------------------------
complete -c jbl -s a -l all-remotes -d 'Show all remote bookmarks including untracked'
complete -c jbl -f   -l remote      -d 'Show bookmarks for a specific remote' -r
complete -c jbl -s t -l tracked     -d 'Show tracked remote bookmarks only'
complete -c jbl -s c -l conflicted  -d 'Show conflicted bookmarks only'
complete -c jbl -s r -l revisions   -d 'Show bookmarks pointing to these revisions' -r
complete -c jbl -s T -l template    -d 'Render each bookmark using the given template' -r
complete -c jbl -l sort             -d 'Sort bookmarks by key' -r -f -a "name name- author-date author-date- committer-date committer-date-"

# ---------------------------------------------------------
# Functions
# ---------------------------------------------------------

# jbc: create a bookmark and immediately track it at origin
function jbc
   if test (count $argv) -lt 1
       echo "Usage: jbc <bookmark>"
       return 1
   end
   jj bookmark create $argv[1]
   jj bookmark track --remote=origin $argv[1]
end

# jlw: watch jj log on an interval (default 2s)
function jlw
   set interval 2
   if test (count $argv) -gt 0
       set interval $argv[1]
   end
   watch -n $interval --color jj log --color=always
end

function jdf
    set revset 'trunk()..@'

    if test (count $argv) -gt 0
        set revset $argv[1]
    end

    set revs (jj log --no-graph --reversed -r "$revset" -T 'change_id.shortest() ++ "\n"')

    if test (count $revs) -eq 0
        echo "No commits matched: $revset"
        return 0
    end

    for rev in $revs
        set full_msg (jj log --no-graph -r "$rev" -T 'description' | string collect)
        set description_lines (string split \n -- $full_msg)
        set usable_lines (string match --invert --regex '^JJ: ' -- $description_lines)
        set first_line $usable_lines[1]

        if test -z "$first_line"
            echo "$rev: no usable description"
            continue
        end

        if test "$full_msg" = "$first_line"
            echo "$rev: unchanged"
            continue
        end

        echo "$rev: $first_line"
        jj --quiet desc "$rev" --message "$first_line"
    end
end

# ---------------------------------------------------------
# jbc completions
# ---------------------------------------------------------
complete -c jbc -f
complete -c jbc -s r -l revision -d 'Target revision for the new bookmark' -r
