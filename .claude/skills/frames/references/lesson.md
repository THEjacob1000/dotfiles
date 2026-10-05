# Interactive lesson

An interactive lesson is a frames deliverable served in the browser instead of rendered to video. The learner steps through narrated, diagrammed steps, answers checks, pulls prerequisites, and can ask for one step to be regenerated. The deliverable is the learner event log returned to you.

## Workflow

1. Optionally fetch the `frames.lesson_author` MCP prompt with the learner's request, `entry`, `size`, and optional `framing`. It returns this contract plus the deterministic placement decisions and learner history from the local learner log.
2. Author the lesson `spec` under the contract below. Its strict input schema is published by `frames.lesson`.
3. Call `frames.lesson` with the `spec` and the absolute repository `workspace_root`. Numen validates the spec, grounds every code reference against real source, synthesises narration, serves the page, opens the browser, and blocks until the learner finishes, leaves, or times out.
4. Act on the returned `status`:
   - `finished`, `abandoned`, `timed_out`: the session ended; `events` holds its learner log.
   - `regenerate`: amend the step named by `step_id` using `complaint` and `events`, then rerun.
   - `open_failed`: the browser could not be opened; `page_path` is the retained page.
   - `plan_required`: the spec exceeds the `limit` of 12 steps; split it with `frames.lesson_plan`.

To turn the same grounded spec into a rendered explainer video instead, pass it to `frames.init` and follow the video workflow.

## Lesson authoring contract

You are the lesson author. Numen owns validation, grounding, narration synthesis, rendering, delivery, and logging; it does not author or repair lesson content.

### Diagnose before writing

- Classify each step as a naming gap or a concept gap. Every step teaches the recognisable mechanism in plain words before the formal term and never opens with the term. A naming gap then attaches the missing name; a concept gap builds the missing causal model before naming it.
- A term is never assumed understood because it drew no objection. Silence, approval, and progress through the page provide no vocabulary evidence.
- Treat learner history only as evidence of exposure and explicit signals. With no logged exposure to this step's concept, explain first and check afterward. Only logged exposure to the same concept permits the check to come first; exposure to an unrelated concept does not count. Finishing, advancing, or not objecting never proves comprehension.
- A pulled prerequisite, including Rust, is evidence that the learner opened it, not evidence they can already use its jargon or mechanism. Teach the needed part in plain words at the point of use.
- Never open with a calibration question. There is no calibration probe.
- Analogies may come from exactly these demonstrated domains: Barony/game modding, Rust, hospitality/ordering, payments, Linux tooling, and the AI field. Never analogise from another part of the system the learner is currently failing to understand.

### Build each step around the failure

- Lead with the verdict first. Centre the plausible wrong model and its failure mode, then explain why the real mechanism avoids it; do not write a correct walkthrough in a vacuum.
- Never state a mechanism without the reason it exists, even when the step budget is tight.
- Explain the mechanism against the familiar mechanism it replaces or resembles.
- When entry is an artifact, isolate its unfamiliar sub-concepts. Do not summarise the artifact.
- State the decision the design embodies, the alternative, and the cost paid for the decision—not only how the mechanism works.
- Target density, not brevity. Maximum useful reason per second is the goal; removing the reason to shorten a step is a failure.
- Speed, animation, and three-dimensional presentation may support an explanation, but never replace the mechanism, its failure mode, or the cost it pays.
- Declare every prerequisite with its own short explanation, authored up front. Its breadcrumb expands that explanation inline and logs whether the learner pulled it.

### Narration register

Use the Fireship register precisely: maximum information per second; no preamble; no outro; humour as pacing, never as personality. The lesson must be entertaining, but entertainment must ride inside a second that also teaches and never buy runtime of its own. Do not use reaction-commentary. Never editorialise about the lesson, the learner, progress, or your own explanation. Never end a step by offering to explain more.

### Checks

- Use `none` when there is no prior basis to retrieve. Choice, free-text, and counterfactual checks use the claim form: state a concrete claim to judge, not an open “what happens?” question.
- Set every real check's `placement` explicitly from same-concept learner history: `explain_first` without prior exposure, `check_first` with it. Omission means `explain_first`.
- Choice is deterministic. Free-text is compared with a grounded model answer. A counterfactual requires a real `code_ref`, names a hypothetical change to that grounded code, and asks the learner to predict breakage only; it never asks them to write a patch or fix broken code.
- The answer reveal is always present and available at any point, before or after submission. Treat `reveal_answer` as evidence that the learner took the explanation, never as a correct answer or comprehension signal.
- Never plant a falsehood or bad design as a trap. Accuracy is load-bearing because the learner cannot independently detect a confident fabrication.

### Grounding and visual contract

- Use declared code references only. Never invent code, paste remembered code, or silently omit a reference that might not resolve. Grounding failure must remain loud.
- Author diagram operations from the same step data as narration. The animation must keep the visual changing while audio plays; a static diagram under narration fails the format.
- Supply data only. There is no raw HTML field or escape hatch.
- A regeneration outcome returns the step id, learner complaint, and partial answer log to you. Rewrite only that step, preserve the rest of the spec, then call `frames.lesson` again with `resume_step` set to it. Numen never regenerates content itself.

### Scope boundary

- Keep one lesson at 12 steps or fewer. When the request is broader, author the dependency graph yourself and call `frames.lesson_plan`; Numen validates and orders that graph but never derives a syllabus.
- Do not create a course, completion state, feed, push mechanism, or model call. Do not ask the learner to fix broken code. Delivery is on demand and one lesson is disposable.
- Do not add an mp4 export or loom integration to the lesson. Neither substitutes for the disposable browser lesson and its minimal append-only learner log.
- The mechanical verification of learner answers is the highest-value v1.1 item, explicitly deferred. It is not current behavior: do not claim a check compiles, runs, or mechanically verifies unless the calling agent independently performed that verification.
