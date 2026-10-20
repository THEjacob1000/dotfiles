# ~/.config/fish/conf.d/jj_aliases.fish
#
# Completions for jj bookmark aliases (jb, jbm, jbd, jbl, jbr, jbt, jbf, jbc).
# Must live in conf.d/ (not completions/) because completions/ files are keyed
# to a single command name — this file covers many commands at once.

# ---------------------------------------------------------
# Aliases
# ---------------------------------------------------------
function j --wraps="jj" --description "alias j=jj"; jj $argv; end
function ja --wraps="jj abandon" --description "alias ja=jj abandon"; jj abandon $argv; end
function jb --wraps="jj bookmark" --description "alias jb=jj bookmark"; jj bookmark $argv; end
function jbm --wraps="jj bookmark move" --description "alias jbm=jj bookmark move"; jj bookmark move $argv; end
function jbd --wraps="jj bookmark d" --description "alias jbd=jj bookmark d"; jj bookmark d $argv; end
function jbl --wraps="jj bookmark list" --description "alias jbl=jj bookmark list"; jj bookmark list $argv; end
function jbr --wraps="jj bookmark rename" --description "alias jbr=jj bookmark rename"; jj bookmark rename $argv; end
function jbt --wraps="jj bookmark track --remote=origin" --description "alias jbt=jj bookmark track --remote=origin"; jj bookmark track --remote=origin $argv; end
function jbf --wraps="jj bookmark forget" --description "alias jbf=jj bookmark forget"; jj bookmark forget $argv; end
function jc --wraps="jj commit" --description "alias jc=jj commit"; jj commit $argv; end
function jcmsg --wraps="jj commit --message" --description "alias jcmsg=jj commit --message"; jj commit --message $argv; end
function jd --wraps="jj diff" --description "alias jd=jj diff"; jj diff $argv; end
function jdmsg --wraps="jj desc --message" --description "alias jdmsg=jj desc --message"; jj desc --message $argv; end
function je --wraps="jj edit" --description "alias je=jj edit"; jj edit $argv; end
function jgcl --wraps="jj git clone" --description "alias jgcl=jj git clone"; jj git clone $argv; end
function jgf --wraps="jj git fetch" --description "alias jgf=jj git fetch"; jj git fetch $argv; end
function jgp --wraps="jj git push" --description "alias jgp=jj git push"; jj git push $argv; end
function jgpa --wraps="jj git push --all" --description "alias jgpa=jj git push --all"; jj git push --all $argv; end
function jl --wraps="jj log" --description "alias jl=jj log"; jj log $argv; end
function jn --wraps="jj new" --description "alias jn=jj new"; jj new $argv; end
function jrb --wraps="jj rebase" --description "alias jrb=jj rebase"; jj rebase $argv; end
function jrbt --wraps="jj git fetch; and jj rebase -b @ -d 'trunk()'" --description "alias jrbt=jj git fetch; and jj rebase -b @ -d 'trunk()'"; jj git fetch; and jj rebase -b @ -d 'trunk()' $argv; end
function jrs --wraps="jj restore" --description "alias jrs=jj restore"; jj restore $argv; end
function jrt --wraps='cd "(jj root || echo .)"' --description 'alias jrt=cd "(jj root || echo .)"'; cd "(jj root || echo .)" $argv; end
function js --wraps="jj squash" --description "alias js=jj squash"; jj squash $argv; end
function jsp --wraps="jj split" --description "alias jsp=jj split"; jj split $argv; end
function jsps --wraps="jj split --siblings" --description "alias jsps=jj split --siblings"; jj split --siblings $argv; end
function jst --wraps="jj st" --description "alias jst=jj st"; jj st $argv; end
function jsto --wraps="jj squash --into" --description "alias jsto=jj squash --into"; jj squash --into $argv; end
function jnt --wraps="jj git fetch; and jj new 'trunk()'" --description "alias jnt=jj git fetch; and jj new 'trunk()'"; jj git fetch; and jj new 'trunk()' $argv; end
function jmm --wraps="jj new @ 'trunk()'; and jj commit -m 'Merge in master'" --description "alias jmm=jj new @ 'trunk()'; and jj commit -m 'Merge in master'"; jj new @ 'trunk()'; and jj commit -m 'Merge in master' $argv; end
function jcp --wraps="jj commit; and jj git push --all" --description "alias jcp=jj commit; and jj git push --all"; jj commit; and jj git push --all $argv; end

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

function jds
    jj diff $argv --stat | tail -1
end

# ---------------------------------------------------------
# jbc completions
# ---------------------------------------------------------
complete -c jbc -f
complete -c jbc -s r -l revision -d 'Target revision for the new bookmark' -r
