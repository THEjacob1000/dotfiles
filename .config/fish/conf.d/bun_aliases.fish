# ~/.config/fish/conf.d/bun_aliases.fish
#
# Completions for bun aliases (bb, bi, br, bt, bts, bd, brt, brb).
# `b` = `bun` works via --wraps automatically — no extra completions needed.
# `bx` = `bunx` is a real binary with its own completions — skip it too.

# ---------------------------------------------------------
# Aliases
# ---------------------------------------------------------
alias b="bun"
alias bb="bun build"
alias bi="bun i"
alias bx="bunx"
alias bts="bun test"
alias br="bun run"
alias brt="bun run test"
alias bt="bun test"
alias bd="bun dev"
alias brb="bun run build"

# ---------------------------------------------------------
# bb = bun build — file args + build flags
# ---------------------------------------------------------
complete -c bb -F
complete -c bb -l outdir      -r -d 'Output directory'
complete -c bb -l outfile     -r -d 'Output file'
complete -c bb -l target      -r -d 'Target environment' -a 'browser bun node'
complete -c bb -l format      -r -d 'Module format' -a 'esm cjs iife'
complete -c bb -l splitting      -d 'Enable code splitting'
complete -c bb -l minify         -d 'Minify output'
complete -c bb -l sourcemap   -r -d 'Sourcemap mode' -a 'none inline external linked'
complete -c bb -l entry-naming -r -d 'Customise output entry file name'
complete -c bb -l external    -r -d 'Exclude module from bundle'
complete -c bb -l define      -r -d 'Substitute K:V while bundling'
complete -c bb -l loader      -r -d 'Set loader for a file extension'
complete -c bb -l compile        -d 'Compile to a standalone executable'

# ---------------------------------------------------------
# bi = bun install — install flags
# ---------------------------------------------------------
complete -c bi -f
complete -c bi -l yarn        -d 'Write a yarn.lock file (yarn v1)'
complete -c bi -l production  -d "Don't install devDependencies"
complete -c bi -l optional    -d 'Add dependency to optionalDependencies'
complete -c bi -l development -d 'Add dependency to devDependencies'
complete -c bi -l no-save     -d "Don't update package.json or save a lockfile"
complete -c bi -l dry-run     -d "Don't install anything"
complete -c bi -l force       -d 'Always request latest versions & reinstall all'
complete -c bi -l no-cache    -d 'Ignore manifest cache entirely'
complete -c bi -l silent      -d "Don't output anything"
complete -c bi -l verbose     -d 'Excessively verbose logging'
complete -c bi -l global      -d 'Use global folder'
complete -c bi -l cwd         -r -d 'Change working directory'
complete -c bi -l cache-dir   -r -d 'Choose a cache directory'

# ---------------------------------------------------------
# br = bun run — scripts, bins, JS files
# ---------------------------------------------------------
complete -c br -f -a "(__fish__get_bun_scripts)"
complete -c br -f -a "(__fish__get_bun_bins)"
complete -c br -F -a "(__fish__get_bun_bun_js_files)"

# ---------------------------------------------------------
# bt / bts = bun test — file args + test flags
# ---------------------------------------------------------
for cmd in bt bts
    complete -c $cmd -F
    complete -c $cmd -l timeout    -r -d 'Per-test timeout in ms'
    complete -c $cmd -l bail       -r -d 'Abort after N failures'
    complete -c $cmd -l rerun-each -r -d 'Re-run each test N times'
    complete -c $cmd -l preload    -r -d 'Import a module before tests run'
    complete -c $cmd -l only          -d 'Only run tests marked with .only'
    complete -c $cmd -l todo          -d 'Include tests marked with .todo'
    complete -c $cmd -l coverage      -d 'Enable code coverage'
end

# ---------------------------------------------------------
# bd = bun dev — mostly done, basic flags
# ---------------------------------------------------------
complete -c bd -f
complete -c bd -s p -l port -r -d 'Port number'
complete -c bd -l hot          -d 'Enable hot reloading'

# ---------------------------------------------------------
# brt = bun run test — same as bt
# ---------------------------------------------------------
complete -c brt -F
complete -c brt -l timeout    -r -d 'Per-test timeout in ms'
complete -c brt -l bail       -r -d 'Abort after N failures'
complete -c brt -l rerun-each -r -d 'Re-run each test N times'
complete -c brt -l preload    -r -d 'Import a module before tests run'
complete -c brt -l only          -d 'Only run tests marked with .only'
complete -c brt -l todo          -d 'Include tests marked with .todo'
complete -c brt -l coverage      -d 'Enable code coverage'

# ---------------------------------------------------------
# brb = bun run build — same as bb
# ---------------------------------------------------------
complete -c brb -F
complete -c brb -l outdir      -r -d 'Output directory'
complete -c brb -l outfile     -r -d 'Output file'
complete -c brb -l target      -r -d 'Target environment' -a 'browser bun node'
complete -c brb -l format      -r -d 'Module format' -a 'esm cjs iife'
complete -c brb -l splitting      -d 'Enable code splitting'
complete -c brb -l minify         -d 'Minify output'
complete -c brb -l sourcemap   -r -d 'Sourcemap mode' -a 'none inline external linked'
complete -c brb -l external    -r -d 'Exclude module from bundle'
complete -c brb -l define      -r -d 'Substitute K:V while bundling'
complete -c brb -l compile        -d 'Compile to a standalone executable'
