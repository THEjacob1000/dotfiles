---
name: jj-pr-flow
description: Commit, branch, prepare, or review changes in a jj (Jujutsu) repo, and open PRs correctly. Use whenever the user says "commit this", "review this PR/branch", "what changed on this branch", or asks in any wording to prep, open, raise, draft, or create a PR (including a draft PR) for a branch. REQUIRED before any `gh pr create` or `gh pr edit`: PR bodies must use the repo's template and PR titles must use the ticket-prefix convention, and both are hook-enforced, so a PR drafted without this skill gets blocked. Covers the jj diff review flow, the shared LOKE org template, [TICKET-123] title prefixes, and push/PR approval boundaries.
generated-by: numen-sync
---

# jj Commit / Branch / PR Flow

Detect: `.jj/` exists means a jj repo (never use mutating git commands). No `.jj/` means a plain git repo, use git normally.

## Committing
1. Finish file-changing tasks with a local commit and a new working-copy change, without waiting for a separate commit request. Respect an explicit request not to commit; don't create an empty commit.
2. Inspect `jj st` and the task's diff. Run applicable lint, typecheck and tests and fix failures introduced by the task. Disclose known pre-existing failures and unrelated findings, but don't treat them as a reason to leave completed, verified work uncommitted locally or claim the whole gate passed.
3. Load `write-as-jacob`, then use `jj commit -m "<type>: <summary>" <owned-paths...>` to commit the task and open the next working-copy change. This is the scoped equivalent of `jj describe` followed by `jj new`. One `-m`, subject line only, naming the actual change. Never sweep unrelated changes into the commit; if a file has mixed ownership, separate the task's hunks first. Unrelated work may remain in the new working copy.
4. Do not create or move branches/bookmarks unless explicitly asked. When requested, use `feat/`, `fix/`, `chore/`, or `refactor/` prefixes. Local completion never authorizes a push, PR or merge.

## Reviewing a branch / PR locally
- Full branch diff: `jj diff -r main..@` (or `jj diff --from main --to @`). Per-commit: `jj log -r main..@` then `jj diff -r <change-id>`.
- When asked to "save the review": write findings to `review.md` in the repo root, ordered most-severe-first, each with file:line and a concrete failure scenario.

## Creating a PR (ONLY when the user asked for a PR in the current turn)
Pushing/PR-creating without an in-turn request is forbidden (global Hard Boundaries, prior approval never carries over).
1. Ensure a bookmark points at the head: `jj bookmark set <name> -r @-`.
2. `jj git push --bookmark <name> --allow-new`.
3. Run `pr-prep`. It resolves repo, org, bookmark, ticket ids, the correct
   template, any existing PR, and writes a body draft with the ticket placeholder
   already filled. Don't rediscover any of that by hand, and don't write a body
   from scratch when it hands you a template: `pr-template-check` blocks the
   `gh pr create` if sections are missing. Draft PRs are not exempt.
4. Write the prose into the draft. Voice: the **write-as-jacob** skill. Never
   `--fill`, commit messages are source material, not a publishable description.
5. `gh pr create --head <bookmark> --title "<title_prefix> <summary>" --body-file <draft>`.
6. Report the PR URL.

### Templates and titles
- `template_source: repo` means the repo's own template always wins.
- `template_source: loke-default` means a LOKE org repo with no local template, so the
  shared LOKE template is used automatically. This is expected; don't ask about it.
- Title is `[LOKE-1234] <plain summary>`: the `title_prefix` from pr-prep, then the
  summary. No conventional-commit prefix. Space-separated if there are genuinely
  several tickets. Never invent a second one.
- No ticket found: leave the `[LOKE-XXXX]` placeholder in the body and omit the
  prefix from the title.
- **Leave `<!-- -->` blocks commented out** unless you have real content for them.
  If there are no related PRs, or the rollback is just a code revert, the block
  stays commented. Uncommenting one to write "None" or "N/A" is wrong.
- Tick only checklist items that are actually true. Don't tick "provided clear
  evidence" when there's no evidence in the body. Leave it and say so.

## Gotchas
- `jj git fetch` then rebase. Never operations that auto-push.
- Conflicted working copy: `jj st` shows conflicts; resolve in-file, don't `jj abandon` user work.
- To inspect a remote PR without pushing anything: `gh pr diff <n>` / `gh pr view <n>` are fine (read-only).
