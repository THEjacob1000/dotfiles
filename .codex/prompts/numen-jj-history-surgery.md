# /jj-history-surgery

Rewrite jj history that already exists. Use whenever Jacob says "time travel", "absorb these into the right commits", "restructure this into a clean stack", "split that change", "reorder these", "squash it into X", asks why commits are immutable, or wants a branch reshaped into stacked PRs. Covers jj squash/absorb/rebase/split/new --insert, the immutable-commit wall, and undo via the op log.

# jj history surgery

"Time travel" means: the work exists, it is in the wrong shape, put it in the right shape. Nothing here needs a push, and none of it is allowed to do one.

## Look before you cut

```sh
jj log -r 'main..@'        # the stack you're reshaping
jj log -r 'main..@' -p     # with diffs, when you need to know what's where
jj diff -r <change-id>     # one change
jj st                      # what's loose in the working copy
```

Work in change ids (the stable `qtvxyz` letters), not commit hashes. A change id survives every rewrite below; a hash does not.

## Putting loose work into the right commit

`jj absorb` is the one to reach for first. It takes the working copy and pushes each hunk into the ancestor that last touched those lines, which is exactly "absorb these into the relevant changes". Hunks it can't attribute stay behind in the working copy.

```sh
jj absorb                     # auto-distribute what it can
jj absorb --into 'main..@'    # restrict the candidates
```

When absorb can't tell, be explicit:

```sh
jj squash --into <rev>              # working copy into a specific change
jj squash -r <from> --into <to>     # one change into another
jj squash -i --into <rev>           # pick hunks interactively
jj squash <path>... --into <rev>    # only these files
```

Path scoping matters in a shared working copy. Another agent's pending edits are in there too, and a bare squash sweeps them in.

## Reshaping the stack

```sh
jj split -r <rev>                    # one change becomes two, interactively
jj split -r <rev> <path>...          # split by path, no prompt
jj rebase -r <rev> -d <dest>         # move one change
jj rebase -s <rev> -d <dest>         # move it and everything on top
jj rebase -b <rev> -d <dest>         # move the whole branch it belongs to
jj new --insert-before <rev>         # start a new change ahead of an existing one
jj edit <rev>                        # work directly inside an old change
jj abandon <rev>                     # drop a change, keeping its descendants
```

After `jj edit <rev>`, run `jj new` before starting the next unit or the next edit piles into that same old change.

Conflicts are recorded in the commits rather than blocking the command, so a rebase "succeeds" with conflicts inside it. Always `jj log` afterwards and resolve what's marked, rather than assuming a clean exit means clean history.

## "Why are these commits immutable"

jj refuses to rewrite anything in `immutable_heads()`, which by default is `trunk()` and its ancestors plus tags. Getting that error means the commits are already on the trunk bookmark or on a remote.

That is a signal, not an obstacle to route around. If it is genuinely local-only history that jj is being conservative about, the config knob is `revset-aliases."immutable_heads()"` in `~/.config/jj/config.toml`. If it is on a remote, stop: rewriting it means a force push, which is a hard boundary. Say so and let Jacob decide.

## Undo

`jj op log` is the whole-repo undo history and it is the real safety net.

```sh
jj op log                    # every operation, newest first
jj op restore <operation-id> # put the repo back exactly as it was
jj undo                      # just the last operation
```

Two limits worth knowing before you rely on it. It cannot undo anything that left the machine, so a push is not recoverable this way. And `jj restore <path>` is a different command entirely: it reverts the file to its parent state, discarding your edit, rather than undoing a diff you applied. Save `jj diff --git > /tmp/x.patch` before any restore you are unsure about.

## Stacked PRs

One change, one bookmark, each PR based on the one below it.

```sh
jj bookmark create feat/<name> -r <change-id>
jj log -r 'main..@' -T 'change_id.short() ++ " " ++ bookmarks ++ " " ++ description.first_line() ++ "\n"'
```

Verify every change in the stack has a bookmark and the order matches the intended PR bases before anything is pushed. The push itself and the PR creation need Jacob's approval in the same turn, every time, no exceptions. Reshaping the stack locally is the whole job here.
