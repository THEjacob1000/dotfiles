## Codex-specific notes

Codex CLI is the harness here. `AGENTS.md` is the only always-loaded context
file (there is no `CLAUDE.md` equivalent), and `child_agents_md = true` means
child agents read it too, so the doctrine above governs every Codex thread.

### Enforcement without hooks
Codex has no hook system, so the hard boundaries above are enforced by
instruction plus configuration, not by a blocking hook:
- `~/.codex/rules/default.rules` is an **allow-list** (`prefix_rule(..., decision="allow")`).
  There is deliberately **no** rule that pre-approves `git push`, `jj git push`,
  `gh pr create`, or `gh pr merge` — so those always fall through to an approval
  prompt. Do not add one. Never bypass the prompt to push or open/merge a PR
  without Jacob's explicit same-turn approval.
- Treat networked tools as read-only by default. Search, inspect, and draft
  freely within the requested scope, but require explicit approval before
  posting, publishing, pushing, merging, dispatching remote agents, changing
  third-party resources, or modifying credentials. When approval is ambiguous,
  produce a local plan or draft instead of taking the external action.
- The `pre-push` git hook runs lint/typecheck/test only; it is a verification
  gate, not an auto-push. It never initiates a push.

### Delegation → Codex child agents
Map the delegation philosophy to the roles defined in `~/.codex/config.toml`:
- **explorer** — read-only evidence gathering: bulk search, codebase mapping,
  "where/how is X done" before proposing changes.
- **reviewer** — correctness/security/missing-tests review after any nontrivial
  change (the "review before done" step).
- **docs-researcher** — verify APIs, framework behavior, and release notes
  instead of guessing from memory.

Default model is `gpt-5.5`. Use `/agent` to inspect and steer child agents;
`multi_agent`, `hooks`, and `goals` features are enabled. Prefer the `strict`
profile (read-only sandbox) for exploration and reserve `yolo` for trusted,
well-scoped local work.

### Session preamble — read shared memory
At the start of a coding session, if working inside a project directory, check for
a Claude-side memory index and read it if present (it carries durable, non-obvious
facts about the project — decisions, gotchas, live-box quirks):

    ~/.claude/projects/<project-slug>/memory/MEMORY.md

where `<project-slug>` is the project's absolute path with `/` replaced by `-`
(e.g. `/home/jacob/Documents/Developer/numen` → `-home-jacob-Documents-Developer-numen`).
MEMORY.md is a one-line-per-fact index; open a linked file under that `memory/`
dir only when its hook looks relevant. This is a read-only convenience so Codex
and Claude share the same memory without relocating either store.

### MCP
Two ways in to Numen's memory/context, both engine-agnostic:
- The **numen** MCP server (registered in `~/.codex/config.toml [mcp_servers]`)
  exposes loom's read surfaces (memory search/facts/episodes/brief/node) and a
  `chat` tool over loom's authenticated socket. Prefer it for live memory queries.
- The `handoff` script (numen `harness/bin/handoff`) carries state-of-work between
  sessions/engines and, when the vault is wired, pushes it into memory for free.

A local `jj` MCP server is also configured — prefer it for jj operations. Context7
and chrome-devtools MCP servers are available; use them only when a task needs them.
