---
name: terse-pr-review-comments
description: "PR review comment bodies posted in Jacob's name must be short and point-first, not explanatory word walls"
condition: "\\\\?\"body\\\\?\"\\s*:\\s*\\\\?\"[^\"\\\\]{200,}"
scope: "tool"
---

Review comments go out under Jacob's name, and the PR author knows their own code. Keep each comment to about 25 words.

- State the problem in one short sentence. Add a fix or a question only when the problem doesn't already make it obvious.
- Name the issue, not the whole causal chain. Cut "so X, which means Y, and then Z".
- Don't offer alternative fixes. Pick one, or just ask.
- Drop hedged setup like "I'm guessing…" or "I think… because…" unless the doubt is real and short.

Bad: "I think pricing off a tip-inclusive amount here is racy, because the tip comes off the locked row… If a tip update lands between… so the goods portion and the credit basis both end up wrong. Could we take… or have the caller…?"

Good: "This is tip-inclusive but the tip comes from the row, so a concurrent tip update leaves a stale tip in the total."

Rewrite the body shorter before posting.