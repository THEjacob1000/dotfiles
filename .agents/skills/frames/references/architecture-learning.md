# Architecture learning

Use this workflow to teach an unfamiliar codebase, trace a mechanism or explore responsibilities with a learner. The deliverable is a reusable local lesson, not a dependency graph with narration. For tool calls and compatibility, use [lesson](lesson.md).

## Seven steps

1. **Target.** Identify the learner's question and familiarity from their request and relevant history. State two to four observable objectives: explain a boundary, predict a transition, locate a responsibility or evaluate an alternative. Use reasonable assumptions when context is sufficient rather than forcing an onboarding questionnaire. Done when each objective names something the learner could explain or demonstrate.
2. **Inspect.** Read repository instructions, manifests, entry points, relevant modules and tests. Choose one bounded vertical slice. Separate implementation from plans; discovered call/dependency edges are candidates to inspect, not teaching claims. Done when you can follow the selected path across its real boundaries.
3. **Evidence.** Record source selectors, snapshot provenance, claims, uncertainties and any actual observations using [lesson evidence](lesson-evidence.md). Reuse Rust analysis or Ripwire when useful, then read the selected implementation. Done when every architectural assertion has support or an explicit inference/unknown label.
4. **Outline.** Begin with the problem and a small orientation map. Introduce only the vocabulary needed for the next mechanism. Follow one concrete example across boundaries, then vary a consequential condition. A failure-first explanation fits a failure question; it is not the default structure. Done when every step serves an objective and every objective has an explanatory path.
5. **Storyboard.** For each beat, specify the learner question, visible state, narration, supporting claims and semantic change. Choose among the three [scene primitives](lesson-scenes.md). Motion explains operation, identity, ordering, ownership or state; reading and thinking can use static holds. Done when the scene and narration describe the same causal model without unsupported ordering.
6. **Preflight and save.** Run `frames.lesson_check`, fix diagnostics and review grounded excerpts against the prose. Review deterministic seek states and prediction reveals; preflight alone does not establish teaching quality. Save with `frames.lesson_save`, retaining its revision. Done when a valid immutable bundle exists and its claims still match its evidence.
7. **Teach and adapt.** Play guided mode, or explore when the learner wants local inspection. Use questions and explicit feedback to change the smallest affected explanation. Done when the requested explanation is delivered and any returned question has been addressed, not when a completion event suggests mastery.

## Objectives and narration

Prefer “Trace a selected purchase through the locked eligibility recheck” to “Understand the purchase architecture.” Namespace repository concepts separately from transferable concepts; matching labels do not make them the same concept. Keep stable IDs when the represented objective, entity or beat stays the same.

Explain **what**, **how**, then **why** when that order helps. Show the actual responsibility and its mechanism before attaching unfamiliar terminology. A design rationale needs documentary support or an explicit inference label; code shape alone does not establish author intent. Keep uncertainty beside the claim it qualifies.

Use ordinary, readable narration. There is no mandatory Fireship pacing, jargon compression, negative counterfactual or continuous motion. Default to 1x; respect the player's remembered preference and transcript-only use. Checks are optional and skippable, and the explanation must remain useful without them. A variation can demonstrate preserved behavior or a tradeoff, not just breakage.

## Worked example: purchase expiry

The complete authored example is [loke-purchase-expiry.lesson.json](examples/loke-purchase-expiry.lesson.json). Ground it against the corresponding `loke-rs` checkout, not the Numen workspace. It is a source-derived walkthrough, not an observed execution or proof that integration tests ran.

Its three objectives are to trace eligibility and deadline behavior, explain the internal transaction boundary versus external refund completion, and predict the result of a second expiry attempt with a different reference.

- **Orientation:** the worker selects candidates; selection is not a guarantee of mutation. The boundary map distinguishes the concrete `PurchaseStore`, record operations, `Sale` domain and internal effects.
- **Locked path:** follow transaction opening and the locked reload before the domain eligibility recheck. Explain why the scan's earlier result is insufficient. The deadline check provides a concrete variation, including acceptance exactly at the deadline.
- **State and effects:** show the domain rejection/reversal and applicable wallet/points effects. Persisted internal state and a Pending refund do not establish external refund completion. The commit beat names what shares the SQL transaction rather than animating an external provider success.
- **Second attempt:** the alternative scenario assumes A acquires the row lock and commits before B completes its reload, and both calls succeed. B sees the committed rejection. The claim that B does not count a new expiry is labeled an inference through the reference comparison. Source tests support the model, but do not fix which worker wins or turn the animation into a captured run.

Use the example as an authoring pattern, not a promise that its source files match every checkout. Re-ground and review staleness before teaching it as current behavior. Keep scenario assumptions visible when comparing the paths.

## Question → regenerate → revise → resume

“Ask OMP” pauses the lesson and returns a `regenerate` result with reason `question`, the learner's question, selected entity/claim, events and stable bookmark. Confusion returns reason `confusing` and a complaint. The blocking call ends; there is no browser-to-model chat.

Answer against the cited evidence. If content needs changing, revise only the affected explanation and supporting beats/claims, preserving unaffected IDs. Preflight, save with the current `expected_revision`, then play the new bundle using `resume: {step_id, beat_id, offset_ms}` from the result when still appropriate. If those IDs were removed, use the returned `invalid_resume` diagnostic and its `valid_start` explicitly. A question that only needs a conversational answer can resume the existing revision. Keep exposure, answers, reveals, skips, self-assessment and observations separate when adapting the next explanation.
