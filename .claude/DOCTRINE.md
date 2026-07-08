# Jacob's Agent Doctrine (canonical, tool-neutral)

This is the single source of truth for how any coding agent should behave on
Jacob's machine. Tool-specific files (Claude Code's `CLAUDE.md`, Codex's
`AGENTS.md`, etc.) are generated from this file plus a small per-tool supplement
via `sync-agents.sh`. Edit doctrine here, then run the sync script — never
hand-edit a generated file.

## Toolchain
- Bun for runtime + packages (`bun install/test`, `bun run lint|typecheck`);
  `bunx` over `npx`. Exception: npm when a `package-lock.json` exists. Biome for
  lint/format. Always defer to what the current repo is actually configured with.
- Prefer absolute paths over `cd`-prefixed shell commands.

## VCS
- Use jj (Jujutsu) exclusively in any repo that has a `.jj/` directory (most do,
  including colocated jj+git repos). Only fall back to git in a plain-git repo
  with no `.jj/`. Never `git diff/show/log` in a jj repo — use `jj diff` / `jj log`.
- Branches/bookmarks: `feat/`, `fix/`, `chore/`, `refactor/`. Conventional commits.
- One logical step = one local commit with a conventional message.
- Run lint + typecheck + tests before committing.
- In a shared working copy, scope commits to the files you touched (e.g. jj
  filesets) — a bare commit sweeps every pending change, including other agents'.

## Hard boundaries (never violate without explicit user approval in the current turn)
- Never run `jj git push`, `git push`, or any command that writes to a remote.
- Never run `gh pr create`, `gh pr merge`, or any `gh`/API command that mutates
  remote state.
- "Explicit approval" means the user said push/PR/merge in *this* turn. Prior
  approval does not carry over.
- Applies to every agent and loop (executor, orchestrator, autopilot, ralph,
  ultrawork, team, child agents) and overrides any "verify before claiming
  completion" protocol. Stopping at a local commit IS completion.
- If a workflow seems to require a push to verify, stop and ask.

## Code quality
- TypeScript: no `any`, no `as any` escape hatches — proper types; `unknown` +
  type guards only at true boundaries.
- Fix errors at the root cause. Never disable lint rules, `ts-ignore`, comment
  out assertions, `.skip` tests, or loosen expectations to go green.
- After editing, run lint + typecheck + tests and fix everything you introduced
  before reporting done. A task with a stated coverage/quality target is not done
  until the target is hit.
- Match existing repo patterns (look at how a sibling module does it) before
  inventing new ones. Respect layer boundaries (e.g. DB access only through repo
  classes; don't edit shared interfaces to suit one caller).
- Immutability, composition over inheritance, ES modules, named exports, no
  dead/commented-out code.
- Inline comments: 1-2 lines max, explain *why* not *what*; if it needs more, the
  code needs restructuring.
- Prefer the laziest correct solution: standard library before custom code,
  native platform features before dependencies, one line before fifty. Question
  whether a task needs to exist at all before building it.

## Working style
- Bias to autonomy: when a sensible default exists, proceed and report rather
  than asking. Jacob steers by interrupting.
- Report real results (actual test/coverage numbers), never aspirational ones.

## Delegation
Reserve the orchestrator's own context for planning, decisions, and synthesis.
Delegate token-heavy work — bulk search, file inventory, mechanical refactors,
running test suites, log scanning, deep analysis — to subagents/child agents, run
in parallel when the work is independent. Pick a capable model for judgment-heavy
work (implementation, debugging, architecture, review) and a cheaper model for
grunt work (search, renames, formatting, running tests and reporting). After any
nontrivial change, run a code review before considering the work done. Each tool
maps this philosophy to its own agent roles in its supplement below.
