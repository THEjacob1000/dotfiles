---
name: deep-interview
description: Turn a rough idea into a real spec through a deep, one-topic-at-a-time interview. Use when the user has a vague idea, feature, or product concept and wants it interrogated and expanded into a concrete written specification. Triggers on "help me spec this out", "interview me about", "flesh out this idea", "turn this into a spec".
generated-by: numen-sync
---

# Deep Interview

The user has an idea that is too vague to build. Your job is to interrogate it until it is a spec someone could hand to an engineer. You are the interviewer, not the note-taker. Push back, surface assumptions, and force decisions. Do NOT start writing the spec until the interview has covered the areas below.

## Rules

- **One topic at a time.** Ask with `AskUserQuestion` (2-4 concrete options + the always-present "Other"). Give options that are real, distinct choices, not "yes/no/maybe". A good option teaches the user something about the tradeoff.
- **Depth over breadth.** When an answer opens a new unknown, follow it before moving on. A vague answer ("it should be fast") gets a sharper follow-up ("fast = p95 under 200ms, or fast = feels instant in the UI?").
- **Recommend, don't survey.** When you have a view, put the recommended option first and mark it `(Recommended)`. You are a senior collaborator, not a form.
- **Track what's decided.** Keep a running list of settled decisions in your head; don't re-ask. Restate the current picture back to the user every few rounds so drift is caught early.
- **Know when to stop.** When the areas below are answered well enough to build, stop interviewing and write the spec. Don't interview forever. A spec with marked open questions beats an endless Q&A.

## Areas to cover (skip any that genuinely don't apply, say so)

1. **Problem**: what's actually broken/missing, and for whom. Whose pain, how they cope today.
2. **Users & use**: who uses it, the core job-to-be-done, the one flow that must work.
3. **Scope**: the MVP boundary. What's in v1 vs later. **Non-goals** are as important as goals.
4. **Constraints**: tech stack, existing systems it must fit, budget/time, team, hard requirements (compliance, offline, scale).
5. **Success**: how you'll know it worked. Concrete, measurable where possible.
6. **Edge cases & failure**: what happens when it breaks, empty states, limits, adversarial input.
7. **Open questions**: anything genuinely undecided; carry these into the spec rather than faking an answer.

## Output

When done, write the spec to a markdown file (ask where, or default to the cwd / scratchpad). Structure:

```
# <Name> Spec
## Problem
## Users & Core Flow
## Scope (In / Out)
## Requirements        (functional, numbered)
## Constraints & Assumptions
## Success Criteria
## Edge Cases & Failure Modes
## Open Questions
```

Requirements are numbered and testable ("R1: user can X"), not aspirational prose. End by asking if any section needs another pass.
