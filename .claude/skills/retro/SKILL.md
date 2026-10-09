---
name: retro
description: Retrospective on a coding session that proposes fixes to the agent environment (doctrine, rules, skills, checks, reviewer, tooling) so the next run goes better. Use when the user says "retro", "retrospective", or asks what to change after a session went badly.
generated-by: numen-sync
---

# Retro

You are improving the environment future agents run in, not the code the session produced. Read the session, find where it lost time or got something wrong, and propose the smallest change to the environment that would have prevented it.

## Read the session

Default to the current session. For another one, read its transcript:

- OMP: `~/.omp/agent/sessions/<cwd relative to $HOME, / as ->/*.jsonl`, newest first. The `archive` global in eval searches past sessions and prompts.
- Claude Code: `~/.claude/projects/<absolute cwd, / as ->/*.jsonl`.
- Codex: `~/.codex/sessions/`.

Note each wrong turn: a file it couldn't find, a mistake a check would have caught, a rule it broke, an expensive call, a fact it never had.

## Where a fix can live

Every fix lands in the numen harness, so it reaches every tool through `numen sync`. Pick the cheapest home that would have worked:

- **Automated check**: a lint, type, test or `numen check` rule. Best when the mistake is mechanical; it costs no context at all.
- **Reviewer rule**: a line in `harness/canonical/agents/code-reviewer.md`. The reviewer reads a diff with little context pressure, so standards belong there, not in the implementer's prompt.
- **Path-scoped rule**: `harness/canonical/rules/<name>.md`, loaded only when the agent touches the files it claims.
- **Skill**: `harness/canonical/skills/`, or a pin in `harness/canonical/skills.toml`. Only its description sits in context, so it suits a workflow reached on demand.
- **Doctrine**: `harness/canonical/doctrine.md` or a repo `AGENTS.md`. Always loaded, so it costs every turn of every session; use it for navigation pointers and hard boundaries only.
- **Tooling or information access**: an OMP extension under `harness/canonical/omp/extensions/`, an MCP entry in `harness/canonical/mcp.toml`, or a ripwire verb the agent should have used.

## Also look for

- Doctrine or AGENTS.md lines that changed nothing in this session's behaviour and could move into a rule, a skill or a check.
- Tool calls that returned far more than the agent needed.
- Instructions the agent followed that contradict another file.

## Report

List the candidates, most severe first. For each, give the session evidence (what happened, and where in the transcript), the file to change, and the exact change. Don't apply them until the user picks.
