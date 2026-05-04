# JJ + GitHub CLI: Creating PRs with Proper Branch Naming

## The Insight

`jj git push --change @` auto-generates a bookmark named `push-<changeId>` — this is never the right branch name for a PR. Always create a named bookmark first, then push it. Renaming after the fact requires closing and recreating the PR because GitHub ties PRs to branch names.

`gh pr create` cannot detect the active JJ branch automatically — always pass `--head <bookmark-name>` explicitly or it will fail to target the right branch.

## Why This Matters

If you push with `--change @` first, you end up with a `push-*` branch on the remote, a PR tied to that name, and a messy cleanup sequence: rename local bookmark, push new name, delete old remote branch, close old PR, create new PR. Doing it right the first time takes one extra step and saves four.

## Recognition Pattern

- Working in a JJ repository
- User asks to create a PR (draft or otherwise)
- No existing named bookmark on the current change (`jj log -r @` shows no bookmark or a `push-*` bookmark)

## The Approach

**Step 1 — Create a named bookmark before pushing:**
```
jj bookmark create feature/<2-3-word-description> -r @
jj git push --bookmark feature/<2-3-word-description>
```
Branch naming convention: `feature/`, `fix/`, `chore/`, `refactor/` prefix + 2-3 word kebab-case description.

**Step 2 — Create the draft PR with a written description (never --fill alone):**
```
gh pr create --draft --base main --head feature/<name> --title "<title>" --body "$(cat <<'EOF'
## Problem
<What was broken and why it mattered>

## Changes
<What was changed and the reasoning>

## Behaviour / Notes
<Any tables, edge cases, or reviewer guidance>
EOF
)"
```

**Step 3 — If cleanup is needed (push-* bookmark already exists):**
```
jj bookmark rename push-<id> feature/<name>
jj git push --bookmark feature/<name>          # push new branch
jj git push --bookmark push-<id>               # delete old remote branch
gh pr close <old-pr-number>
gh pr create --draft --base main --head feature/<name> ...
```

## PR Description Guidelines

- **Problem** section: what was broken, not what was changed
- **Changes** section: the approach taken and why, not a diff summary
- Use a table for before/after behaviour when there are multiple scenarios
- Keep it concise — reviewers read it before they read the code

## Example (from session)

```bash
jj bookmark create feature/live-order-filtering -r @
jj git push --bookmark feature/live-order-filtering
gh pr create --draft --base main --head feature/live-order-filtering \
  --title "fix: filter live order updates by active customer selection" \
  --body "..."
```
