# KiroCrew Workspace

This is the KiroCrew runtime workspace. Agents spawned by KiroCrew (heartbeat,
research, knowledge, yolo) operate here.

## Boundaries

- **memory/** and **knowledge/** are runtime state — never committed, rebuilt on
  each machine by KiroCrew itself.
- **HEARTBEAT.md** is a task queue — transient, never committed.
- **.kiro/settings/cli.json** holds reproducible workspace config (toolSearch etc.)
  and IS tracked.

## Agent behaviour

- Use `~/Documents/Developer` as the default search scope for LOKE project work.
- KiroCrew agents index READMEs and project context into the knowledge DB at
  runtime — that DB is ephemeral per-machine.
- The heartbeat agent picks up tasks from HEARTBEAT.md on each cycle.
- All persistent config lives in `~/.dotfiles` (managed by GNU Stow + numen sync).

## Cross-platform notes

- Paths use `~` or `$HOME` — never hardcoded `/Users/jacob` or `/home/jacob`.
- MCP server configs are machine-local (`~/.kiro/settings/mcp.json`, gitignored)
  because they reference platform-specific binaries.
- Skills are projected by `numen sync` directly to `~/.kiro/skills/` (not stow).

## Harness parity

All three harnesses (Claude Code, Codex, Kiro) share the same numen doctrine and
skills. They differ only in engine-specific surfaces:

| Aspect | Claude Code | Codex | Kiro CLI / IDE |
|--------|-------------|-------|----------------|
| Doctrine file | `~/.claude/CLAUDE.md` | `~/.codex/AGENTS.md` | Repo `AGENTS.md` (native) |
| Skills | `~/.claude/skills/` | `~/.agents/skills/` | `~/.kiro/skills/` |
| Permissions | bypass (dangerous mode) | yolo (full sandbox) | yolo agent (all-allow) |
| MCP | `~/.claude/settings.json` | `~/.codex/config.toml` | `~/.kiro/settings/mcp.json` |
| VCS | jj MCP + Bash | jj MCP + exec | jj MCP + shell |
| Memory | numen MCP (loom) | numen MCP (loom) | knowledge DB (local) |

Switching harness mid-task: use `handoff emit` to capture state-of-work, then
`handoff ingest` in the new harness. Skills and doctrine are already synced.
