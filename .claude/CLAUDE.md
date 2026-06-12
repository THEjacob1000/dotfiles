<!-- OMC:START -->
<!-- OMC:VERSION:4.14.6 -->

# oh-my-claudecode - Intelligent Multi-Agent Orchestration

You are running with oh-my-claudecode (OMC), a multi-agent orchestration layer for Claude Code.
Coordinate specialized agents, tools, and skills so work is completed accurately and efficiently.

<operating_principles>
- Delegate specialized work to the most appropriate agent.
- Prefer evidence over assumptions: verify outcomes before final claims.
- Choose the lightest-weight path that preserves quality.
- Consult official docs before implementing with SDKs/frameworks/APIs.
</operating_principles>

<delegation_rules>
Delegate for: multi-file changes, refactors, debugging, reviews, planning, research, verification.
Work directly for: trivial ops, small clarifications, single commands.
Route code to `executor` (use `model=opus` for complex work). Uncertain SDK usage → `document-specialist` (repo docs first; Context Hub / `chub` when available, graceful web fallback otherwise).
</delegation_rules>

<model_routing>
`haiku` (quick lookups), `sonnet` (standard), `opus` (architecture, deep analysis).
Direct writes OK for: `~/.claude/**`, `.omc/**`, `.claude/**`, `CLAUDE.md`, `AGENTS.md`.
</model_routing>

<skills>
Invoke via `/oh-my-claudecode:<name>`. Trigger patterns auto-detect keywords.
Tier-0 workflows include `autopilot`, `ultrawork`, `ralph`, `team`, and `ralplan`.
Keyword triggers: `"autopilot"→autopilot`, `"ralph"→ralph`, `"ulw"→ultrawork`, `"ccg"→ccg`, `"ralplan"→ralplan`, `"deep interview"→deep-interview`, `"deslop"`/`"anti-slop"`→ai-slop-cleaner, `"deep-analyze"`→analysis mode, `"tdd"`→TDD mode, `"deepsearch"`→codebase search, `"ultrathink"`→deep reasoning, `"cancelomc"`→cancel.
Team orchestration is explicit via `/team`.
Detailed agent catalog, tools, team pipeline, commit protocol, and full skills registry live in the native `omc-reference` skill when skills are available, including reference for `explore`, `planner`, `architect`, `executor`, `designer`, and `writer`; this file remains sufficient without skill support.
</skills>

<verification>
Verify before claiming completion. Size appropriately: small→haiku, standard→sonnet, large/security→opus.
If verification fails, keep iterating.
</verification>

<execution_protocols>
Broad requests: explore first, then plan. 2+ independent tasks in parallel. `run_in_background` for builds/tests.
Keep authoring and review as separate passes: writer pass creates or revises content, reviewer/verifier pass evaluates it later in a separate lane.
Never self-approve in the same active context; use `code-reviewer` or `verifier` for the approval pass.
Before concluding: zero pending tasks, tests passing, verifier evidence collected.
</execution_protocols>

<hooks_and_context>
Hooks inject `<system-reminder>` tags. Key patterns: `hook success: Success` (proceed), `[MAGIC KEYWORD: ...]` (invoke skill), `The boulder never stops` (ralph/ultrawork active).
Persistence: `<remember>` (7 days), `<remember priority>` (permanent).
Kill switches: `DISABLE_OMC`, `OMC_SKIP_HOOKS` (comma-separated).
</hooks_and_context>

<cancellation>
`/oh-my-claudecode:cancel` ends execution modes. Cancel when done+verified or blocked. Don't cancel if work incomplete.
</cancellation>

<worktree_paths>
State: `.omc/state/`, `.omc/state/sessions/{sessionId}/`, `.omc/notepad.md`, `.omc/project-memory.json`, `.omc/plans/`, `.omc/research/`, `.omc/logs/`
</worktree_paths>

## Setup

Say "setup omc" or run `/oh-my-claudecode:omc-setup`.
<!-- OMC:END -->

<!-- User customizations -->
# Global Preferences

## Defaults
- Runtime: Bun (not Node.js)
- Package manager: Bun — **unless a `package-lock.json` exists in the project root, in which case use npm**
- Linting: Biome
- Use ES modules, named exports
- Conventional commits

## Hard Boundaries (never violate without explicit user approval in the current turn)
- Never run `jj git push`, `git push`, or any command that writes to a remote.
- Never run `gh pr create`, `gh pr merge`, or any `gh` command that mutates remote state.
- Never run `jj git fetch --remote origin` followed by operations that auto-push.
- "Explicit approval" means the user said push/PR/merge in *this* turn. Prior approval does not carry over.
- This applies to all agents (executor, orchestrator, autopilot, ralph, ultrawork, team) and overrides any "verify before claiming completion" protocol. Stopping at a local commit IS completion.
- If a workflow seems to require a push to verify, stop and ask.

## Commands
- Install: `bun install`
- Test: `bun test`
- Lint: `bun run lint`
- Typecheck: `bun run typecheck`

## Git
- Branch naming: feat/, fix/, chore/, refactor/
- Always use `gh pr create --fill` for PRs
- Run tests before committing

## VCS
We use jj (Jujutsu), not git. Use jj commands exclusively.
- Fall back to git only if jj is genuinely unavailable.
- Branches: `feat/`, `fix/`, `chore/`, `refactor/`.
- PRs and pushes: see Hard Boundaries. Do not infer permission from prior turns.
- Branch naming: feat/, fix/, chore/, refactor/
- Always use `gh pr create --fill` for PRs
- Run tests before committing
NEVER use git commands directly. Always use jj equivalents.

## Code Quality (Universal)
- TypeScript: no `any` — use `unknown` + type guards
- Prefer immutability (`const`, `readonly`, frozen objects)
- Prefer composition over inheritance
- Conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`)
- ES modules, named exports
- No dead code, no commented-out code

## Toolchain Defaults
- Runtime/PM: Bun (not Node.js/npm/yarn/pnpm)
- Linter: Biome
- Install: `bun install` | Test: `bun test` | Lint: `bun run lint` | Types: `bun run typecheck`
NOTE: If a project is configured with another tool, ensure you use the tool set up in the current repo

## Agent Delegation

I have specialist agents installed in `~/.claude/agents/`. Always automatically delegate to the most appropriate agent based on the task — never ask me to specify one.

Routing rules:

- Backend, API, database, proto, migrations → Backend Architect
- Flutter, mobile, Dart → Mobile App Builder
- React, Next.js, web UI, components → Frontend Developer
- Refactoring, code quality, architecture decisions, complexity reduction → Senior Developer
- CI/CD, infrastructure, deployments, environments → DevOps Automator
- Design system, tokens, UI components → UI Designer + UX Architect
- User flows, journeys, UX decisions → UX Researcher
- Security review, auth, threat modelling → Security Engineer
- API testing, contract testing, QA → API Tester
- Production readiness, quality gates → Reality Checker
- Sprint planning, prioritisation, roadmaps → Sprint Prioritizer
- Task breakdown, scoping, estimation → Senior Project Manager
- Multi-domain tasks spanning 3+ areas → Agents Orchestrator
- Linear, project management, ticket work → Jira Workflow Steward
- Legal, compliance, privacy → Legal Compliance Checker
- Brand, copy, voice → Brand Guardian
- Growth, GTM, acquisition → Growth Hacker
- Debugging, root-cause analysis, regression isolation → Senior Developer
- Build errors, type errors, toolchain failures → Senior Developer
- Test strategy, coverage, flaky tests → API Tester
- Code review, PR review → Code Reviewer
- Documentation, migration notes, READMEs → Technical Writer
- Git operations, commit strategy, rebasing, history hygiene → Git Workflow Master
- System design, boundaries, interfaces, tradeoffs → Software Architect
- Dependency evaluation, SDK/API/package assessment → Software Architect
- Database schema, query optimisation, indexing → Database Optimizer
- Data pipelines, ETL, streaming → Data Engineer
- Rapid prototyping, MVPs, proof of concepts → Rapid Prototyper
- Accessibility audits, WCAG compliance → Accessibility Auditor
- Performance testing, benchmarking, load testing → Performance Benchmarker
- AI/ML features, model integration, embeddings → AI Engineer
- MCP server development, tool building → MCP Builder

When a task spans multiple domains, delegate to the Agents Orchestrator and let it coordinate the appropriate sub-agents.
# graphify
- **graphify** (`~/.claude/skills/graphify/SKILL.md`) - any input to knowledge graph. Trigger: `/graphify`
When the user types `/graphify`, invoke the Skill tool with `skill: "graphify"` before doing anything else.