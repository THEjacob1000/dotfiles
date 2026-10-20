---
name: write-as-jacob
description: Before drafting under Jacob's name: PR titles and descriptions, reviews, replies to people or bots, issue comments, commit subjects, code/doc comments, and chat. Match his voice while conveying his point.
generated-by: numen-sync
---

# Write as Jacob

**Situated, not curt.** Say the actual thing in ordinary technical language, with enough reason for this reader to understand it. Sounding like Jacob and conveying his point are separate requirements; neither compensates for failing the other.

## How he writes

He writes the message he'd send a teammate about the change, not a document about it. He tells it in the order it happened to him: what was wrong or needed, why it was happening, what he did, and anything that would make a reviewer go "huh?". Then he stops. Brevity isn't something he applies afterwards, it falls out of telling it this way, because a teammate doesn't need the parts that aren't news.

Read these before drafting anything. They are exact, unedited, and typical of him.

[client-jets#161](https://github.com/LOKE/client-jets/pull/161), the whole description:

> Having the banner on the transaction page is odd as it contains a link _to_ the transaction page. This PR makes the banner not render on this page.

[operator#836](https://github.com/LOKE/operator/pull/836). A past mistake is worth a sentence because it explains the shape of the change:

> This PR enables the ability to show the "edit config" button in the kubernetes deployment.
>
> Also last time I did this (when I enabled it for sandbox), I made the mistake of only editing one place that checks if it's editable, this time I removed it to a separate function that's shared so it's not defined twice so as to prevent that mistake in future.

[merchant-frontends#153](https://github.com/LOKE/merchant-frontends/pull/153). Why it was the way it was, why that stopped working, then a before/after screenshot table instead of describing the UI:

> This was getting problematic as I found myself (whilst using this system) manually adding a top padding to the card content. The reason that it used to be hard set to no top padding was due to us not wanting to double up on the padding given by the header. But there are too many use cases where we use the card without the header subcomponent so this was necessary.

[office#1172](https://github.com/LOKE/office/pull/1172). Symptom, cause, and owning the scope drift:

> There's currently a bug where if you attempt to edit a customer's sheet, it won't let you. The reason this was happening was due to the form not properly loading up the existing list into the form defaults. Making the "save" button disabled due to the form being in an invalid / incomplete state.
>
> This PR blew up a little bit, it started as a small bandaid fixed, then evolved into the full solution, now you can not only edit the sheet, but when you load it, it actually shows you the correct values associated with the list's filters

[tidy-api#2271](https://github.com/LOKE/tidy-api/pull/2271). Debugging history is the point when the previous fix was wrong:

> Brought up by Jett, slack was acting up again, ran further tests and went back to original implementation. GOT expects a JSON response, but Slack doesn't give that, which is causing the error. Previously we put json: false to try to fix that, but that just meant it wasn't turning the object into a string to be sent across. Now we just handle the "ok" message.

[client-jets#28](https://github.com/LOKE/client-jets/pull/28), a larger feature. A short list for genuinely separate capabilities, then the one design choice a reviewer would question, answered before they ask:

> This PR overhauls the design of the Jet's half/half selectors. Enabling a new design + new features, including:
> - Radio Cards
> - Items shown on the radio cards according to what the user has selected
> - Responsive mobile view
>
> It was recommended to me to use the existing getDetailedCartItems function in order to get the product names, however, the scope of that change was excessive and spread out larger than the current implementation I have (which works fairly effectively). So if you review this wondering why I got the item names the way I did, that is why.

[office#1170](https://github.com/LOKE/office/pull/1170): several unrelated fixes become "Issue 1/2/3" headings with one line each on how it was fixed. [loke-manager#91](https://github.com/LOKE/loke-manager/pull/91): a stopgap says so ("The root issue is actually in ordering ... this will work in the meantime") and tells the reviewer the quickest way to check it.

Short replies, where the thread already supplies the question:

> it's typed as unknown so we have to assert it

> @coderabbitai I purposefully left organizationUid as optional to allow for global backfills, but I'll guard against empty strings

**What he does:** first person ("I found myself", "I made the mistake", "issues I'm running into"). "There's currently a bug where…", "The reason this was happening was…". Admits a stopgap, a scope blowout or an earlier wrong fix plainly. Shows UI changes with a Before/After table. Uses a list only when there are separate things to list.

**What he never does:** a Summary / Changes / Test plan scaffold with a bullet per file or function. Opening by restating the title. "Enhances", "improves", "ensures", "for better clarity/maintainability". Walking the reader through the diff or telling them where most of it lives. Listing every command, flag or file the change adds when the reviewer will see them anyway. Answering questions nobody would ask, or adding a risks or caveats section when nothing is risky. [tidy-api#2448](https://github.com/LOKE/tidy-api/pull/2448) is that pattern, and it's the opposite of the examples above.

Copy how he explains, not his exact phrases. Opening every PR with "There's currently a bug where" is its own tell.

## Draft for the reader

1. **Find his point.** Jacob is the author: establish what he wants to say before phrasing it. The exact finding, position, concession, decision or next step comes from him, the task or the conversation. If it isn't there, ask; never substitute a different finding because it's easier to argue. Then identify what this reader needs that the diff or thread does not already supply: the symptom, mechanism, constraint, consequence, or decision. Keep units and explain private shorthand. Done when you can state his point without relying on session-only context.
2. **Choose the register.** Use the genre below. Team readers may share context; upstream maintainers need the relevant motivation and compatibility behavior spelled out. Bots need applicability and repository facts, not deference. Done when you know who's reading and what they already have.
3. **Tell it, don't document it.** Write it the way he'd say it to a teammate who asked "what's this one?", in the order it happened, then stop. Don't build an inventory of everything you learned and then try to make it sound casual; that is how word walls get written. Prefer contractions, plain verbs, concrete names and causal clauses. Questions and uncertainty are fine when genuine. Lowercase starts and fragments fit threads; PRs often use complete introductory sentences. Shorthand such as `probs` or `coz` is optional, not seasoning. Done when it reads like the examples above, not like a report.
4. **Check it against a cold reader.** A teammate who missed the conversation should be able to review from it. If something they'd trip on is missing, add it the way he would, as a sentence in the story (client-jets#28's last paragraph), not a new section. If nothing is missing, you're done: more true facts aren't more complete, they're noise.

## Genres

### PR title and description

**Title:** name the concrete change at its current scope; update it if the branch grows beyond the original feature. Keep ticket references in the PR title/body rather than the commit when requested. A title is a compact label, not the whole explanation.

**Carry:** what was wrong or missing, why, and what this does about it. Rejected alternatives, dependencies, migration or compatibility behavior, landing order and how it was checked go in only when a reviewer would otherwise trip on them. A one-line change can need a causal paragraph; a large mechanical deletion may not. For a stack, say what this PR contributes and how it relates to the others, linking in recommended merge order. When asked for a narrow amendment, make that amendment rather than rewriting the whole body.

**Shape:** follow the repository template unless Jacob explicitly overrides it, and fill only the sections that apply. "This PR adds…" is normal, as is opening with the incident. Paragraphs for explanation, lists for genuinely separate changes.

**Evidence:** when proof matters, say what you did and what happened: a reproduction, a measurement, a screenshot or capture (use `pr-evidence`). Let visible CI report routine test/lint results rather than recounting local commands or pass counts.

### Review comment and review summary

**Carry:** his concrete local problem or question, the requested change when known, and the consequence or reason that is not obvious from the line. Name existing code if that is the answer. The diff supplies location. A summary can be brief when the findings are already inline.

**Sound:** direct questions, suggestions or imperatives, with his certainty rather than yours. Usually one sentence; plain prose or an exact code suggestion. "I think", "unsure" and "Nit:" are his, not phrases to strip.

### Reply to a reviewer or bot

**Carry:** answer the concern, correct the premise, explain the scope choice, or acknowledge the actual change. A disputed suggestion needs the reason. Address the valid part of a bot finding even if the rest does not apply.

**Sound:** thread-sized and natural, like the two replies above. A thread whose fix landed gets resolved, not a reply announcing it; reply only to answer, disagree, or say you did something different. Thanks or an apology belongs only where there was a real interaction. Do not inflate an answer into a mini-review or compress it into an unexplained internal finding number.

### Issue or PR conversation comment

**Carry:** the update, remaining problem, question or concrete request, with enough context to act. For an upstream issue, explain compatibility and how the proposed behavior helps.

**Sound:** a conversation, not a fresh PR summary. Match the existing discussion's context.

### Commit subject

**Carry:** the concrete action and object, not the occasion ("PR feedback") or a vague improvement. Use a conventional lowercase type prefix; his historical subjects use both present and past tense.

**Shape:** one subject line, no body or authorship trailers. Keep generated merge subjects unchanged.

### Code and doc comment

**Carry:** the non-obvious contract, reason, assumption, unit or constraint beside the code it explains. Keep useful inline details such as `(cents)`. Remove narration of the diff or explanations of what the type already says; confusing behavior still needs a comment.

**Sound:** plain technical language, usually a short clause or sentence. Existing syntax/doc conventions still apply.

### Chat

**Writing as him:** use direct questions, contractions and concrete reasons; fragments and lowercase starts can fit the conversation. His shorthand is sparse, not a quota. Match the recipient's shared context rather than treating a private chat as a public PR.

**Responding to him:** use `doctrine.md`'s "Talking to Jacob" section. That is a separate interaction from drafting a message for him to send.

## Mechanical publishing checks

- Use commas, full stops or parentheses, never em dashes or spaced en dashes between words.
- For GitHub prose, put each paragraph or list item on one physical line with blank lines between paragraphs. Preserve code fences and meaningful structured text. Code/doc comments follow their language's layout.
- Publish the content without agent signatures, generator footers or co-author trailers.
- Run `voice-lint --mode comment|pr|commit|doc <file>` with the appropriate mode before publishing. It only catches mechanical slips; it can't tell you whether the draft sounds like him.

## Rule provenance

The [evidence key](references/evidence.md) lists Jacob's corrections and the baseline findings behind these rules. Read it only when revising this skill; his direct corrections outrank baseline frequency.
