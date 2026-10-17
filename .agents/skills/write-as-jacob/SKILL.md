---
name: write-as-jacob
description: Before drafting under Jacob's name: PR titles and descriptions, reviews, replies to people or bots, issue comments, commit subjects, code/doc comments, and chat. Match his voice while conveying his point.
generated-by: numen-sync
---

# Write as Jacob

**Situated, not curt.** Say the actual thing in ordinary technical language, with enough reason for this reader to understand it. Sounding like Jacob and conveying his point are separate requirements; neither compensates for failing the other.

## Draft for the reader

1. **Find his point.** Jacob is the author: establish what he wants to say before phrasing it. The exact finding, position, concession, decision or next step comes from him, the task or the conversation. If it isn't there, ask; never substitute a different finding because it's easier to argue. Then identify what this reader needs that the diff or thread does not already supply: the symptom, mechanism, constraint, consequence, or decision. Keep units and explain private shorthand. Done when you can state his point without relying on session-only context.
2. **Choose the register.** Use the genre below. Team readers may share context; upstream maintainers need the relevant motivation and compatibility behavior spelled out. Bots need applicability and repository facts, not deference. Size follows the knowledge gap and semantic scope, not changed-line count. Done when the draft answers the reader's actual concern.
3. **Read it aloud.** Prefer contractions, plain verbs, concrete names and causal clauses: what happens, because of what, so what. Questions and uncertainty are useful when genuine. Lowercase starts and fragments fit threads; PRs often use complete introductory sentences. Shorthand such as `probs` or `coz` is optional, not seasoning. Done when it sounds like a person explaining this change, not a formal report with casual words pasted in.
4. **Cut repetition, keep meaning.** Remove generic praise, diff narration and sentences that cost the reader no fact if deleted. Preserve the reason, relevant caveat and evidence. Done when removing more would lose useful information, and the result still sounds like him.

## Genres

### PR title and description

**Title:** name the concrete change at its current scope; update it if the branch grows beyond the original feature. Keep ticket references in the PR title/body rather than the commit when requested. A title is a compact label, not the whole explanation.

**Carry:** the missing capability or old symptom, what happens now, and the mechanism or main pieces needed to understand it. Include rejected alternatives, dependencies, migration/compatibility behavior, landing order or manual proof when they affect review. A one-line change can need a causal paragraph; a large mechanical deletion may not. For a stack, say what this PR contributes and how it relates to the others; preserve useful GitHub PR-link presentation.

**Sound:** concrete and conversational. “This PR adds…” is normal, as is opening with the incident. Use paragraphs for explanation and lists for genuinely separate changes, APIs or steps. Follow the repository template unless Jacob explicitly overrides it; headings are structure, not a voice test. A design explanation earns its place when it answers a likely reviewer question.

**Size:** start with the few facts this reader needs, not a section for every possible concern. A small fix often needs only a sentence or paragraph; add detail where it changes understanding or a review decision. A list of correct facts can still be too verbose or sound alien. When asked for a narrow amendment, make that amendment rather than rewriting the whole body; order stack links by recommended merge order.

**Evidence:** explain what you exercised and what happened when that matters: a reproduction, comparative measurement, screenshot or capture. Use `pr-evidence` for captures. Let visible CI report routine test/lint results rather than recounting local commands or pass counts. This does not remove meaningful test scenarios or replace proof with “tested”.

**Cold-reader completion:** a reviewer without the session can say (1) what was wrong or missing, (2) what changes in behavior and how the main pieces fit, (3) what outside this diff is affected or deliberately unchanged, when applicable, and (4) how material claims were established. Links supplement those answers; they do not replace them. Then read for voice again: adding all the facts in alien prose is still a failure.

### Review comment and review summary

**Carry:** his concrete local problem or question, the requested change when known, and the consequence or reason that is not obvious from the line. Name existing code if that is the answer. The diff supplies location; a reviewer without shared background may need more explanation. A summary can be brief when the findings are already inline.

**Sound:** direct questions, suggestions or imperatives, with his certainty rather than yours. One point is often one sentence, not a mandatory sentence limit. Plain prose or an exact code suggestion usually suffices; use structure only when it makes multiple points easier to follow. “I think” and “unsure” are legitimate uncertainty, not phrases to mechanically strip.

### Reply to a reviewer or bot

**Carry:** answer the concern, correct the premise, explain the scope choice, or acknowledge the actual change. A disputed suggestion needs the reason. Address the valid part of a bot finding even if the rest does not apply.

**Sound:** thread-sized and natural. A thread whose fix landed gets resolved, not a reply announcing it; reply only to answer, disagree, or say you did something different. Thanks or an apology belongs only where there was a real interaction, never as a wrapper around every reply. Do not inflate an answer into a mini-review or compress it into an unexplained internal finding number.

### Issue or PR conversation comment

**Carry:** the update, remaining problem, question or concrete request, with enough context to act. For an upstream issue, explain compatibility and how the proposed behavior helps.

**Sound:** a conversation, not a fresh PR summary. Match the existing discussion's context.

### Commit subject

**Carry:** the concrete action and object, not the occasion (“PR feedback”) or a vague improvement. Use a conventional lowercase type prefix; his historical subjects use both present and past tense.

**Shape:** one subject line, no body or authorship trailers. Keep generated merge subjects unchanged.

### Code and doc comment

**Carry:** the non-obvious contract, reason, assumption, unit or constraint beside the code it explains. Keep useful inline details such as `(cents)`. Remove narration of the diff or explanations of what the type already says; confusing behavior still needs a comment.

**Sound:** plain technical language, usually a short clause or sentence. Let the information set the size; neither essay comments nor deleting meaningful units is success. Existing syntax/doc conventions still apply.

### Chat

**Writing as him:** use direct questions, contractions and concrete reasons; fragments and lowercase starts can fit the conversation. Preserve the point before shortening it. His shorthand is sparse, not a quota. Match the recipient's shared context rather than treating a private chat as a public PR.

**Responding to him:** use `doctrine.md`'s “Talking to Jacob” section. That is a separate interaction from drafting a message for him to send.

## Mechanical publishing checks

- Use commas, full stops or parentheses, never em dashes or spaced en dashes between words.
- For GitHub prose, put each paragraph or list item on one physical line with blank lines between paragraphs. Preserve code fences and meaningful structured text. Code/doc comments follow their language's layout.
- Publish the content without agent signatures, generator footers or co-author trailers.
- Run `voice-lint --mode comment|pr|commit|doc <file>` with the appropriate mode before publishing. Fix supported mechanical findings rather than bypassing the hook. It cannot judge voice, truth or information sufficiency: passing lint does not finish the draft.

## Real examples

Exact excerpts of his own writing. Copy the explanatory moves, not the typos or the phrasing.

**Larger informative PR:** [client-jets#28](https://github.com/LOKE/client-jets/pull/28), 221 changed lines. Separate capabilities plus the reason a reviewer might question the approach.

> This PR overhauls the design of the Jet's half/half selectors. Enabling a new design + new features, including:
> - Radio Cards
> - Items shown on the radio cards according to what the user has selected
> - Responsive mobile view
>
> It was recommended to me to use the existing getDetailedCartItems function in order to get the product names, however, the scope of that change was excessive and spread out larger than the current implementation I have (which works fairly effectively). So if you review this wondering why I got the item names the way I did, that is why.

**Debugging PR:** [tidy-api#2271](https://github.com/LOKE/tidy-api/pull/2271). Background and the failed prior assumption are the point, not bloat.

> Brought up by Jett, slack was acting up again, ran further tests and went back to original implementation. GOT expects a JSON response, but Slack doesn't give that, which is causing the error. Previously we put json: false to try to fix that, but that just meant it wasn't turning the object into a string to be sent across. Now we just handle the "ok" message.

**Short reply:** [merchant-frontends#5](https://github.com/LOKE/merchant-frontends/pull/5#discussion_r1891137401). The thread supplies the question; the answer supplies the reason.

> it's typed as unknown so we have to assert it

**Bot reply:** [tidy-api#2624](https://github.com/LOKE/tidy-api/pull/2624#discussion_r3075657629). Explain the intentional behavior and accept the valid part.

> @coderabbitai I purposefully left organizationUid as optional to allow for global backfills, but I'll guard against empty strings

## Rule provenance

The [evidence key](references/evidence.md) lists Jacob's corrections and the baseline findings behind these rules. Read it only when revising this skill; his direct corrections outrank baseline frequency.
