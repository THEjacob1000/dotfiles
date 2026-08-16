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
- One logical step = one local commit with a conventional message. Subject line
  only, never a body, and it names the actual change ("fix: null-check geocode
  response", not "chore: implemented PR feedback"). Merge commits keep the
  standard `Merge branch 'x' into y`, not a conventional prefix.
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

### PR writing voice
- These rules override default PR formats supplied by skills or commands, including
  ECC. An explicit user request or repository PR template still wins.
- Write PR descriptions in Jacob's direct, compact voice: short declarative
  paragraphs, concrete behaviour, no sales pitch or architecture tutorial.
- Preserve the repository's PR template and fill only applicable sections. Outside
  required template text, target 100-200 words unless the user asks for detail or
  the change genuinely needs migration, rollout, security, or compatibility notes.
- State what changed and why, then tests, dependencies, and rollback only when
  material. Do not narrate the implementation file-by-file, automated review
  process, agent work, or exhaustive evidence already visible in CI.
- Avoid generic headings, repeated summaries, tables for simple changes, bold-label
  bullet walls, and filler such as "This PR delivers". Prefer the same plain style
  as: "Adds X. Y now uses Z. Failures fall back to A."
- Before publishing, delete any paragraph whose removal would not cost the reviewer
  a decision, risk, dependency, or verification fact.

## Delegation
Reserve the orchestrator's own context for planning, decisions, and synthesis.
Delegate token-heavy work — bulk search, file inventory, mechanical refactors,
running test suites, log scanning, deep analysis — to subagents, run in parallel
when the work is independent. Pick a capable model for judgment-heavy work
(implementation, debugging, architecture, review) and a cheaper model for grunt
work. After any nontrivial change, run a code review before considering the work
done.

Delegation protects context; it is not a reflex. Size the response to the prompt,
not to the topic's importance. Do it inline when:
- The prompt is a **question** — "is X done?", "can we start Y?", "what's the state
  of Z?". Answering means reading a doc or two and saying so. Spawning an agent to
  answer a question you could answer in three tool calls is a loss, and a status
  question about a big subsystem is still just a question.
- The whole job is a handful of greps, a few file reads, or a single-file edit.
- You already have the answer in context.

Never spawn an agent whose output you would only relay. If a fresh agent would need
a long brief just to start, writing the brief was the expensive part — do the work.

### Stay unoccupied
Once work is delegated, the orchestrator's remaining job is to be reachable. Any
foreground block — a long command, a blocking wait, a synchronous agent run — stops
three things at once: new prompts from Jacob, messages from the subagents already
running, and their completion notifications. The input you are blocking out is often
the input that would change the plan.

So **the orchestrator never occupies its foreground with anything that has
duration.** Subagents, test suites, builds, long scans and waits all go to the
background; the notification brings the result back. Waiting is not work — if
nothing is left to do inline, end the turn rather than hold it open with a
blocking command, and never poll a job that will notify you. Inside an autonomous
loop, where ending the turn ends the loop, park on the loop's own wakeup
(`ScheduleWakeup`, a `Monitor`) — still never on a blocking waiter.

Being occupied is legitimate only while composing and dispatching a delegation, or
for a short synchronous read whose answer decides the very next action. If a call
could outlast a sentence or two, background it instead.

### Delegation → Codex model tiers
GPT-5.6 splits into three durable tiers (the number is the generation; the name is
the tier, advancing on its own cadence). Pick by how much judgment the work needs —
the same capable-for-thinking / cheap-for-grunt split as above:
- **sol** (`gpt-5.6-sol`): flagship, and the orchestrator — the main thread runs it
  at `max` effort. Reserve it for hard multi-step work: implementation,
  debugging/root-cause, architecture, code/security review, long-running agentic
  tasks.
- **terra** (`gpt-5.6-terra`): balanced. ~2× cheaper than sol, ~on par with the old
  gpt-5.5 — the natural default for everyday production coding and moderate analysis
  that doesn't need sol's ceiling.
- **luna** (`gpt-5.6-luna`): fastest and cheapest. Grunt work with little thinking —
  bulk search/inventory, mechanical refactors, log scanning, formatting, running
  suites.

### Delegation → Codex child agents
Codex's main thread is sol at `max` effort — it is already the capable model, so a
child agent buys context headroom, never capability. That makes the inline gate above
bite harder here, not less: spawn only for a broad sweep, a long log, a full suite
run, or genuinely parallel work.

Map the roles in `~/.codex/config.toml` to those tiers:
- **explorer** — read-only evidence gathering: bulk search, codebase mapping,
  "where/how is X done" before proposing changes. luna for plain lookups; terra when
  the exploration needs real analysis.
- **reviewer** — correctness/security/missing-tests review after any nontrivial
  change (the "review before done" step). sol.
- **docs-researcher** — verify APIs, framework behavior, and release notes instead
  of guessing from memory. terra (luna for a single quick lookup).

Default model is `gpt-5.6-sol` (set in `~/.codex/config.toml`). Use `/agent` to
inspect and steer child agents; `multi_agent`, `hooks`, and `goals` are enabled.
Prefer the `strict` profile (read-only sandbox) for exploration; reserve `yolo` for
trusted, well-scoped local work.

## Codex-specific notes
Codex CLI is the harness here. `AGENTS.md` is the only always-loaded context file
(no `CLAUDE.md` equivalent), and `child_agents_md = true` means child agents read
it too, so this doctrine governs every Codex thread.

### Enforcement without hooks
Codex has no hook system, so the hard boundaries above are enforced by instruction
plus configuration, not a blocking hook:
- `~/.codex/rules/default.rules` is an **allow-list**
  (`prefix_rule(..., decision="allow")`). There is deliberately **no** rule
  pre-approving `git push`, `jj git push`, `gh pr create`, or `gh pr merge` — they
  always fall through to an approval prompt. Do not add one; never bypass the
  prompt without Jacob's explicit same-turn approval.
- Treat networked tools as read-only by default. Search, inspect, and draft freely
  within the requested scope, but require explicit approval before posting,
  publishing, pushing, merging, dispatching remote agents, changing third-party
  resources, or modifying credentials. When approval is ambiguous, produce a local
  plan or draft instead.
- The `pre-push` git hook runs lint/typecheck/test only — a verification gate, not
  an auto-push; it never initiates a push.

### Session preamble — read shared memory
At the start of a coding session inside a project directory, check for a
Claude-side memory index and read it if present:

    ~/.claude/projects/<project-slug>/memory/MEMORY.md

where `<project-slug>` is the project's absolute path with `/` replaced by `-`
(e.g. `/home/jacob/Documents/Developer/numen` →
`-home-jacob-Documents-Developer-numen`). MEMORY.md is a one-line-per-fact index;
open a linked file under that `memory/` dir only when its hook looks relevant.

### MCP
Two engine-agnostic ways into Numen's memory:
- The **numen** MCP server (`~/.codex/config.toml [mcp_servers]`) exposes loom's
  read surfaces (memory search/facts/episodes/brief/node) and a `chat` tool over
  loom's authenticated socket. Prefer it for live memory queries.
- The `handoff` script (`harness/bin/handoff`) carries state-of-work between
  sessions/engines and, when the vault is wired, pushes it into memory for free.

A local `jj` MCP server is also configured — prefer it for jj operations. Context7
and chrome-devtools MCP servers are available; use them only when a task needs them.
<!-- numen:sync:end -->
