---
name: pr-review-inline
description: Strictly review a GitHub PR and leave the findings as inline comments in a pending review. Use whenever Jacob says "strictly review PR N", "review PR N and leave the comments inline", "save your review comments as part of a pending review", or asks for a re-review after new pushes. Covers what to be harsh about, the pending-review API call, and the rules for replying to existing threads.
generated-by: numen-sync
---

# Inline PR review

Findings go inline on the line they're about, in a **pending** review Jacob submits himself. Never post a summary block comment, and never submit the review.

Load **write-as-jacob** before writing a single comment body. Every comment is published under his name.

## Read the diff first
`gh pr diff <n>` for the change, `gh pr view <n> --json title,body,files`. On a stacked PR, diff against the real base (`gh pr view <n> --json baseRefName`) so you don't review the parent's changes again.

Refactor or move-only PR: only flag what the diff *introduced*. Code that merely moved is not a finding, even when it's bad. Jacob has had to say this more than once.

## Be harsh about
- Useless tests: mocks asserted against their own mocks, tests exercising a library instead of our code, snapshot churn, tests that pass whatever the code does.
- Comments that restate the code, or any comment doing the job of a name.
- Error paths that swallow, default, or silently continue where the PR's whole point was the failure.
- A change that breaks an existing consumer without saying so.
- Missing coverage on the thing the PR exists to fix.

Not findings: style the formatter owns, pre-existing behaviour, hypothetical futures, anything the repo already does everywhere else.

## Posting it
Build the payload as a file, then one API call. `event` MUST be `PENDING`.

```sh
cat > /tmp/review.json <<'EOF'
{
  "commit_id": "<head sha from: gh pr view <n> --json headRefOid>",
  "event": "PENDING",
  "comments": [
    { "path": "pkg/loyalty/parallel.go", "line": 310, "side": "RIGHT",
      "body": "`var err error` is dead, the `:=` on the next line covers it" }
  ]
}
EOF
gh api repos/<owner>/<repo>/pulls/<n>/reviews --input /tmp/review.json --jq '.id, .state'
```

- `line` must be a line present in the diff, on the `side` you name, or the API 422s the whole review. On a 422, fix the offending entry and repost, don't drop to block comments.
- Multi-line finding: `start_line` + `line`.
- No `body` on the review itself. A pending review with a top-level body reads as a summary, and Jacob wants the substance inline.

## Replying to existing threads
- Reply only to answer a question, disagree, or say you did something different. Never to announce a fix. Resolve those instead.
- Reply inline on the thread (`gh api repos/<o>/<r>/pulls/<n>/comments -f in_reply_to=<id>`), never as a new top-level comment.
- Bot findings (CodeRabbit etc): verify each against current code first, fix what's still valid, and give a one-line reason for each one you skip. See **coderabbit-resolve**.

## Re-review
Diff what changed since your last review (`gh pr diff <n> --patch` against the reviewed sha) and read the replies to your comments. Only comment on new code and unresolved findings. Two rounds is the cap: if findings survive that, list them to Jacob and stop.
