# Completions for tools that print their own fish script. A tool only gets completions while it is on
# PATH (so mise project pins stay scoped), and the script is regenerated whenever the binary changes.
if not status is-interactive
    exit
end

# tool:command that prints its fish completions
set -g __tc_specs \
    'axiom:axiom completion fish' \
    'bacon:env COMPLETE=fish bacon' \
    'buf:buf completion fish' \
    'codex:codex completion fish' \
    'copilot:copilot completion fish' \
    'doppler:doppler completion fish' \
    'dua:dua completions fish' \
    'fly:fly completion fish' \
    'flyctl:flyctl completion fish' \
    'gh:gh completion -s fish' \
    'gitleaks:gitleaks completion fish' \
    'golangci-lint:golangci-lint completion fish' \
    'helm:helm completion fish' \
    'jfit:jfit completion fish' \
    'jj:env COMPLETE=fish jj' \
    'just:just --completions fish' \
    'loke:loke completion fish' \
    'lychee:lychee --generate complete-fish' \
    'mbx:mbx completion fish' \
    'mise:mise completion fish' \
    'numen:numen completions fish' \
    'omp:omp completions fish' \
    'railway:railway completion fish' \
    'rg:rg --generate complete-fish' \
    'rumdl:rumdl completions fish' \
    'sentry-cli:sentry-cli completions fish' \
    'stripe:stripe completion --shell fish --write-to-stdout' \
    'tak:tak completion fish' \
    'task:task --completion fish' \
    'taplo:taplo completions fish' \
    'tg:tg completion fish' \
    'trivy:trivy completion fish' \
    'uv:uv generate-shell-completion fish' \
    'uvx:uvx --generate-shell-completion fish' \
    'wrangler:wrangler complete fish' \
    'xcodes:xcodes --generate-completion-script fish' \
    'yq:yq shell-completion fish' \
    'zellij:zellij setup --generate-completion fish'

set -g __tc_dir (set -q XDG_CACHE_HOME; and echo $XDG_CACHE_HOME; or echo $HOME/.cache)/fish/tool-completions

# Empty stubs first in fish_complete_path stop fish's bundled scripts autoloading alongside ours.
mkdir -p $__tc_dir/stubs
for spec in $__tc_specs
    set -l stub $__tc_dir/stubs/(string split -m1 -f1 : $spec).fish
    test -e $stub; or echo '# managed by conf.d/tool-completions.fish' >$stub
end
contains $__tc_dir/stubs $fish_complete_path; or set -p fish_complete_path $__tc_dir/stubs

function __tc_sync --on-variable PATH
    for spec in $__tc_specs
        set -l tool (string split -m1 -f1 : $spec)
        set -l bin (command -s $tool)
        set -l seen __tc_bin_(string escape --style=var -- $tool)
        test "$bin" = "$$seen"; and continue
        set -g $seen $bin
        complete -c $tool -e
        test -n "$bin"; and complete -c $tool -f -a "(__tc_load $tool)"
    end
end

# Swaps the placeholder for the real script on first Tab, then answers that Tab with it.
function __tc_load -a tool
    complete -c $tool -e
    set -l bin (path resolve (command -s $tool))
    set -l cmd (string split ' ' -- (string split -m1 -f2 : (string match -- "$tool:*" $__tc_specs)))
    set -l cache $__tc_dir/$tool-(echo $bin(path mtime $bin) | cksum | string split -f1 ' ').fish
    if not test -s $cache
        if command $cmd >$cache.tmp 2>/dev/null </dev/null; and test -s $cache.tmp
            mv $cache.tmp $cache
        else
            rm -f $cache.tmp
        end
    end
    test -s $cache; and source $cache
    complete -C (commandline -cp)
end

__tc_sync
