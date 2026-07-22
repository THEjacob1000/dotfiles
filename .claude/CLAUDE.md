<!-- numen:sync:begin -->
<!-- Managed by numen sync — do not edit inside this block. Edit harness/canonical/ and re-run `numen sync`. -->

# Jacob's Agent Doctrine (canonical)

Single source of truth for how any coding agent should behave on Jacob's machine.
`numen sync` projects this into each tool's native file (`~/.claude/CLAUDE.md`,
`~/.codex/AGENTS.md`). Never hand-edit a synced block — edit this file and re-run
`numen sync`. Content inside a per-tool block (an HTML comment `numen:tool=claude`
or `numen:tool=codex`, closed by `/numen:tool`) renders only into that tool;
everything else renders into both.

## Toolchain
- Bun for runtime + packages (`bun install/test`, `bun run lint|typecheck`);
  `bunx` over `npx`. Exception: npm when a `package-lock.json` exists. Biome for
  lint/format. Always defer to what the current repo is actually configured with.
- Prefer absolute paths over `cd`-prefixed shell commands.

## VCS: jj (Jujutsu)
- Use jj exclusively in any repo with a `.jj/` directory (most do, including
  colocated jj+git repos). Only fall back to git in a plain-git repo with no
  `.jj/`. Never `git diff/show/log` in a jj repo — use `jj diff` / `jj log`.
- Branches/bookmarks: `feat/`, `fix/`, `chore/`, `refactor/`. Conventional commits.
- One logical step = one local commit with a conventional message.
- In a shared working copy, scope commits to the files you touched (e.g. jj
  filesets) — a bare commit sweeps every pending change, including other agents'.
- Run lint + typecheck + tests before committing.

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
- Fix errors at the root cause. Never disable lint rules, `ts-ignore`, comment out
  assertions, `.skip` tests, or loosen expectations to go green.
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
- Prefer the laziest correct solution: standard library before custom code, native
  platform features before dependencies, one line before fifty. Question whether a
  task needs to exist at all before building it.

## Working style
- Bias to autonomy: when a sensible default exists, proceed and report rather than
  asking. Jacob steers by interrupting.
- Report real results (actual test/coverage numbers), never aspirational ones.

## Delegation
Reserve the orchestrator's own context for planning, decisions, and synthesis.
Delegate token-heavy work — bulk search, file inventory, mechanical refactors,
running test suites, log scanning, deep analysis — to subagents, run in parallel
when the work is independent. Pick a capable model for judgment-heavy work
(implementation, debugging, architecture, review) and a cheaper model for grunt
work. After any nontrivial change, run a code review before considering the work
done.

### Delegation → Claude model tiers
Fable is the orchestrator — its tokens are for synthesis and decisions only.
- **fable**: never delegate to. Orchestrates, designs, synthesizes subagent
  reports, makes final calls.
- **opus** (`model: "opus"`): complex work needing real thought — implementation,
  debugging/root-cause, architecture analysis, code review, multi-step research.
- **sonnet** (`model: "sonnet"`): grunt work needing a little judgment — targeted
  search, mechanical refactors that touch logic, triaging suite failures.
- **haiku** (`model: "haiku"`): real grunt work, no judgment — file inventory,
  literal grep/glob sweeps, formatting, running a suite and reporting output,
  log scanning for known patterns. Default here when a task has one obvious
  answer; only step up to sonnet if it needs a call made.

**Delegate ALWAYS when possible** — a hard rule, not a preference. Fable plans,
dispatches, and synthesizes; it does not read file sets, run searches, write code,
or scan output itself when a subagent could. Inline-only work: the plan, reading
reports, resolving conflicts between them, tiny glue actions, final synthesis.

Whom to delegate to:
- Bulk search/analysis → Explore or general-purpose (haiku for mechanical sweeps,
  sonnet for lookups needing judgment, opus for judgment-heavy analysis); parallel
  when independent.
- After nontrivial changes → the matching `ecc:<lang>-reviewer` on opus.
- Feature work → the closest installed specialist agent; fan out on multi-domain
  tasks and synthesize their reports.
<!-- numen:sync:end -->
