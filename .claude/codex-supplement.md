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

### MCP
A local `jj` MCP server is configured — prefer it for jj operations. Context7 and
chrome-devtools MCP servers are available; use them only when a task needs them.
