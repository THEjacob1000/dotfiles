<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/faceless-explainer/SKILL.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->


> **frames references/media-use.md**: Asset resolution (BGM/SFX/images from the HeyGen catalog, brand logos from their official sources) is not available in Numen. Use audio, images and logos the user supplies, and follow `/frames → faceless-explainer/references/media-use.md` for placing and treating them.

# Faceless Explainer to HyperFrames

Use this skill to turn a body of text into an explainer video: pick a design system, plan a teaching story, and build it frame by frame in HyperFrames. **Faceless** means every visual is invented downstream - there is no capture step and no real asset inventory.

> **The front door is `/frames`.** You are the orchestrator. Run each step, verify its gate, and only then continue. This skill is for **explaining a topic from text, with no product and no website to capture**. Any other intent, a bare "make a video", or any uncertainty → read `/frames` first - the intent layer owns every route decision, and a fresh creation arriving here without `BRIEF.md` goes through it anyway (Setup's opening rule).

You are the orchestrator. Work in `videos/<project>/`. Run steps in order and pass each gate before continuing. User-gated steps are Step 0, Step 3, and Step 6. Read `brief-contract.md` before Step 0 - it defines the gate types and how `BRIEF.md`'s `flow`/`storyboard` derive the mode that governs the Step 3/4/6 gates. Do every step yourself except Step 5, where you dispatch one sub-agent per frame. Do not put design or motion rules here; those live in the frame-worker sub-agent, this skill's local `animation/rules` + `animation/blueprints`, and `frames references/creative.md`.

Workflow: Step 0 setup → `hyperframes.json`; Step 1 brief → `capture/extracted/`; Step 2 design system → `frame.md`; Step 3 storyboard/script → `STORYBOARD.md` and `SCRIPT.md`; Step 3.1 audio → `audio_meta.json`; Step 4 visual design → enriched `STORYBOARD.md`; Step 5 frames → `compositions/frames/NN-*.html` and `index.html`; Step 6 final render → `renders/video.mp4`.

---

## Step 0: Setup

Goal: Enter with a confirmed brief, create the HyperFrames project, and make the brief durable.

**The brief is confirmed by the intent layer, not by questions asked here.** Opening rule, in order: **(1)** `BRIEF.md` exists → read it and ask nothing - the brief is settled, and its `flow`/`storyboard` derive the mode (brief contract § 1). **(2)** No `BRIEF.md` but the project exists (`hyperframes.json` / `STORYBOARD.md` on disk) → resume from the storyboard's frontmatter and the recorded preferences; never re-interrogate a half-built project. **(3)** Neither - a fresh creation request that arrived here directly → read `/frames` and run its intent layer (`intent-interview.md`): it checks recipes and remembered defaults, conducts this route's questions (`routes/faceless-explainer.md`), and hands back the locked brief. Edit requests skip all of this - go do the edit.

Initialize only if `hyperframes.json` is missing. Name `<project>` from the topic in kebab-case, such as `compound-interest-explained`; never use workspace name or timestamp.

`frames.init {"project": "/absolute/path/to/project", "example": "blank", "skill": "frames references/faceless-explainer.md"}`

After init, let `<PROJECT_ROOT>` be `videos/<project>` and use it as the working directory for subsequent project-relative paths. In commands below, `.` means `<PROJECT_ROOT>`; never write `.media`, `capture`, or output files in the caller directory.

**Write `BRIEF.md` immediately after init** (never before - `init` refuses a non-empty directory): the intent layer's locked brief, shape per `brief-format.md`. Preference recording and recipe application are not Numen tools; record confirmed fields directly in `BRIEF.md` and apply any adopted recipe by hand, using its `frame.md` as the design source. A recipe fills answers, not approvals; the review gates still run.

Remote sign-in status and authentication are unavailable in Numen.

**Gate:** `hyperframes.json` and `BRIEF.md` exist, and confirmed preference-backed fields are recorded in the brief.

---

## Step 1: Brief (no capture)

Goal: Fold the user's text into the project as the source of information. There is **no website capture and no real assets** - this is a faceless explainer.

Save the user's full input verbatim, then create the synthetic capture package by hand:

- `capture/extracted/visible-text.txt` - the full article / notes / topic / brief, verbatim. This is the source of **information**, not a story template (Step 3 reshapes it).
- `capture/extracted/tokens.json` - `{ "title": "", "description": "", "colors": [], "fonts": [] }`. Fill `title`/`description` from the brief. Leave `colors`/`fonts` empty unless the user explicitly gave brand colors or fonts - then add them (the design preset supplies a complete palette regardless).

If the user pasted a script or wants their wording kept, save it verbatim as `user_script.txt`; `VO_MODE` (verbatim or restructured) comes from `BRIEF.md` - the intent layer asks it when a script arrives. Ask once here only if the brief somehow lacks it, and store the answer for Step 3.

Do **not** run `frames.capture` (there is no URL). Do not create `asset-descriptions.md` or populate `capture/assets/` - faceless visuals are invented in Steps 4-5, not captured. The one exception: if the user supplied a real image, place it under `public/<basename>` and note it for Step 3.

**Gate:** `capture/extracted/visible-text.txt` and `capture/extracted/tokens.json` exist; you can state the explainer's topic and audience in one clear sentence.

---

## Step 2: Design System

When `BRIEF.md` names a `style_preset`, use it; otherwise read `creative/references/design-spec.md` and choose the preset whose look best fits the topic, tone, and audience. Adopt it with `frames.build_frame {"project": "/absolute/path/to/project", "mode": "faceless-explainer", "preset": "<preset>", "tokens": "capture/extracted/tokens.json"}`. The tool writes `frame.md`, stages a supplied caption skin and local fonts, remixes colors by semantic role and display/body font families from tokens, clamps supported font weights, and checks contrast without changing preset keys, geometry or components. Empty brand colors/fonts retain the corresponding preset values; do not hand-edit unrelated parts.

**Gate:** `frame.md` exists from a named preset, and (when the preset ships one) `.hyperframes/caption-skin.html` exists; the chosen preset is recorded in `BRIEF.md`.

---

## Step 3: Storyboard and Script

Goal: Turn the text into an approved frame-by-frame teaching plan.

Read `creative/references/story-spine.md` (hook language, value-before-evidence, storyboard-as-proposal, source-traceable visuals), `faceless-explainer/references/story-design.md`, `animation/blueprints-index.md`, `storyboard-format.md`, and `script-format.md`. Use them to write `STORYBOARD.md` and, when narration is needed, `SCRIPT.md`. Set the frontmatter `duration:` from the brief's `length` - a rough expectation; assembly reports where the cut lands against it.

Before writing a script or narration about code or a technical topic from a repository, ground it. For every symbol, file, or behaviour shown or narrated, write a lesson spec whose steps carry `code_refs` (`{"path": "<file relative to the workspace root>", "item_path": "<module, type or method path>"}`) and pass it to `frames.init` with the authored lesson object as `spec` and the absolute repository path as `workspace_root`. The lesson tool resolves each ref against the workspace and fails on any it cannot ground; write script narration and show code only from the grounded source it returns. Fix or drop a ref that fails rather than narrating from memory.

Use `story-design.md` for the explainer structure (concept / how-to / listicle / story), hook strategy, clarity techniques, emotional beats, the type-enum mapping, and `VO_MODE`. The video's sequence comes from **narrative design, not the input text's paragraph order** - reorder, merge, omit, compress. As a **soft guide**, consult the role→blueprint menu in `animation/blueprints-index.md`: for each beat, write the voiceover in the shape its candidate blueprint implies and tag that candidate `blueprint:` id when one fits. Teaching truth still decides which beats exist - never force a beat to fit a blueprint, and never invent a beat just because a proven shape is available. Faceless visuals are invented downstream, so frames do **not** carry an asset inventory: leave `asset_candidates` empty unless the user supplied a real `public/<basename>` image. Use the exact required fields from the storyboard and script references.
Parse the draft with `frames.storyboard {"project": "/absolute/path/to/project", "mode": "faceless-explainer", "storyboard": "STORYBOARD.md"}` and resolve malformed fields before review. The tool reads the authored plan; it does not invent the teaching story or replace source grounding.


After drafting, run the review loop's plan pass - `review-loop.md` § 1: present the plan as a proposal, and ask the two questions - approve or change, and **sketches first** (recommended) or skip. Feedback arrives as a chat reply; loop until approved. This is a **checkpoint gate** (brief contract § 1): in autonomous mode there is nothing to ask - post the same summary as a heads-up and proceed; sketches collapse into the build, and the one preview question comes at Step 6.

**Gate:** `STORYBOARD.md` exists, every frame has the required narrative fields, `SCRIPT.md` exists when narration is needed, and the user approved the frame-by-frame plan (autonomous: the summary was posted as a heads-up).

---

## Step 3.1: Audio

Goal: Generate narration, word timings, music, and audio metadata from the approved script.

Narration uses the host's configured Numen voice engine, not a provider login or voice download. Optional `bgm` names supplied local audio; `sfx_library` names a supplied local SFX manifest and audio directory for the later pass.

Start audio after Step 3 approval; let it run alongside Step 4 when the host supports background calls. **Choose the narration voice from the user's ask before invoking.** Numen has one voice, `numen` (see `media-use/audio/references/tts.md`). If the request named another voice, gender or tone, say it is unavailable and offer a recorded take instead. Call `frames.narrate {"project": "/absolute/path/to/project", "mode": "faceless-explainer", "command": "generate", "script": "SCRIPT.md", "storyboard": "STORYBOARD.md", "out": "audio_meta.json", "voice": "numen", "speed": 1.0}` to generate, normalize and transcribe narration and write measured voice/word metadata. Use only supplied BGM/SFX; hosted catalog retrieval and HeyGen audio remain unavailable.

Use `music: none` in the STORYBOARD.md top YAML block to turn BGM off. Combined with no `SCRIPT.md`, treat the project as fully silent: no narration, BGM, or SFX. With narration, `music: none` turns off only BGM.

**Gate:** narration and any needed timings are ready, or the project is marked silent (`music: none` + no `SCRIPT.md`).

---

If there is no narration and no `SCRIPT.md`, skip voice generation. Numen does not provide HeyGen music retrieval or SFX catalog access; do not promise those services.


---

## Step 4: Frame Visual Design

Goal: Add the visual direction, layout intent, and motion choices to each storyboard frame.

**Sketch the storyboard sheet first (collaborative only).** The moment the plan is approved, run the sketch pass - `review-loop.md` § 2 (don't wait on Step 3.1; sketches don't use timings): wireframe every frame yourself as a cell of `storyboard.html` (`creative/references/storyboard-recipe.md` § 3), mark each `built`, pause for the one layout question when every frame is `built`, and revise only the sketches named until the sheet is confirmed. Only then write the visual design below onto the confirmed layouts. In autonomous mode, or when the user chose to skip sketches at Step 3, skip this pass - frames go straight from `outline` to `animated` at Step 5.

Edit `STORYBOARD.md` in place. Do not create another storyboard. Use `frame.md` as source of truth for color, type, layout feel, and style.

Read `faceless-explainer/references/visual-design.md`, `animation/blueprints-index.md`, `faceless-explainer/references/motion-language.md`, and `animation/rules-index.md`. Use `visual-design.md` for the method (the time-coded shot sequence, the inline Layout vocabulary, and the invented-visual treatment), plus the required `## Video direction` block. Use `animation/blueprints-index.md` to pick each frame's shot shape. Use `motion-language.md` (the motion vocabulary + the motion doctrine) and `animation/rules-index.md` (valid rule names) for motion - do not invent motion names.

**Search the live catalog before you invent any named look.** A faceless explainer invents every visual, which is exactly when a hand-authored rebuild of an existing block is most likely. For every look, effect, treatment or transition the brief names - "CRT scanlines", "glitch", "film grain", "shimmer sweep", "confetti burst" - run `frames.catalog {"query": "<the look, in plain English>"}` and read the top results BEFORE you write that look into `STORYBOARD.md`. The search needs **nothing installed**: no project, no prior `add`, no account. It ranks the local catalog registry (~400 blocks and components) from any directory. A block that already does the job becomes the frame's `focal` - name it here so Step 5's workers install and customize it. Invent a visual only after a search for it came back with nothing that fits.

For every frame, write a **time-coded shot sequence** into `STORYBOARD.md` per `visual-design.md`'s method: pick the frame's blueprint (or compose), instantiate it with THIS frame's **invented** content, and pace each Scene's reveal to the voiceover so the frame develops across its full duration instead of front-loading then freezing. Because the explainer is faceless, `focal`/`roles` name the **invented visual elements** (a hero word, a diagram node, a data-viz series) - you are designing them, not selecting captured assets. State layout and motion **inline** per Scene (vocabularies in `visual-design.md` and `motion-language.md`). Add one video-wide `## Video direction` block.

Do not change story, script, `transition_in`, or the source text. Do not write HTML in this step. There is **no asset-staging step** - faceless visuals are built by the workers in Step 5. If the user supplied a real `public/<basename>` image, reference it by path in the relevant frame's `focal`/`roles`; otherwise nothing to stage.

**Gate:** every frame has a time-coded shot sequence whose reveals are paced to the voiceover (no front-loading); each frame names its invented `focal` and/or `roles`; `## Video direction` exists. Collaborative: the sketch sheet was confirmed.

---

## Step 5: Build Frames

Goal: Build every storyboard frame as an HTML composition and assemble the playable video.

Wait for narration to finish, then call `frames.narrate {"project": "/absolute/path/to/project", "mode": "faceless-explainer", "command": "sync-durations", "audio_meta": "audio_meta.json", "storyboard": "STORYBOARD.md"}`. Real voice duration wins; silent frames keep estimates. After storyboard SFX cues exist, call `frames.narrate {"project": "/absolute/path/to/project", "mode": "faceless-explainer", "command": "fetch-sfx", "audio_meta": "audio_meta.json", "storyboard": "STORYBOARD.md"}` to merge supplied local SFX while preserving voice/BGM metadata. Skip both calls for fully silent projects; never alter measured timing to fit estimates.

Before dispatch, read `subagent-dispatch.md` and call `frames.frame_packets {"project": "/absolute/path/to/project", "mode": "faceless-explainer", "storyboard": "STORYBOARD.md", "out_dir": ".hyperframes/frame-packets"}`. It writes bounded per-frame packets containing project/design paths, the exact frame block, full selected blueprint and cited rule recipes, plus `_role.md` with shared worker core and this workflow's delta. Keep the 48,000-byte bound; reduce selected material rather than truncating source. Dispatch one sub-agent per frame, in parallel or waves. Each gets `_role.md`, its packet, `PROJECT_DIR`, `frame_id`, confirmed-sketch status and canvas size.


Workers read only their packet and `frame.md`; they never open `STORYBOARD.md` or the skill documents (the packet inlines what was selected upstream). Each worker writes only `compositions/frames/NN-*.html`. Workers must never edit `STORYBOARD.md`.

**Full-bleed backgrounds ride on a `class="clip"` layer, never the `#root`.** A frame's ground (color field / gradient / grid) is its own full-duration background clip - a `background` set on the `#root` / `data-composition-id` element is clip-gated to the frame's window and is not a dependable ground, so dark content can land on the black host `body` and render invisible. The video's base ground is painted by the assembler from `frame.md`'s `canvas` color onto the index `#root`. (Full rule + self-check: `frame-worker-core.md`.)

As each worker returns, the orchestrator marks that frame as `animated` in `STORYBOARD.md`.

After audio timings exist, call `frames.captions {"project": "/absolute/path/to/project", "mode": "faceless-explainer", "command": "build", "storyboard": "STORYBOARD.md", "audio_meta": "audio_meta.json", "out": "caption_groups.json"}`. It builds absolute-time caption groups and seek-safe `compositions/captions.html`, using the preset skin and `frame.md` tokens or the built-in pill, and writes empty caption overrides. With no narration words, captions are skipped; honor an explicit caption skip.

Call `frames.assemble {"project": "/absolute/path/to/project", "mode": "faceless-explainer", "storyboard": "STORYBOARD.md", "audio_meta": "audio_meta.json"}` to build standalone `index.html`. It validates frame files and composition ids, supplies root dimensions and canvas ground, mounts frames in order on track 1, captions on 2, voices on 10, BGM on 11 and SFX on 20+, and registers a paused main timeline. Absent audio metadata means silent assembly. BGM volume defaults to 0.12 under narration or 0.9 without it. Leave transitions for the next step; do not hand-rebuild timing or media mounts.

The caption skin copied in Step 2 supplies the visual style; when absent use the built-in pill style. Captions may be skipped when there are no narration words or they are explicitly skipped.

**Gate:** every frame is marked `animated` (collaborative: the sketch sheet was confirmed at Step 4), `index.html` exists, and captions are built or explicitly skipped.

---

## Step 6: Finalize

Goal: Verify the assembled video, get user approval, and render the final MP4.

Call `frames.transitions {"project": "/absolute/path/to/project", "mode": "faceless-explainer", "command": "inject", "storyboard": "STORYBOARD.md"}`, then `frames.transitions {"project": "/absolute/path/to/project", "mode": "faceless-explainer", "command": "verify", "storyboard": "STORYBOARD.md", "index": "index.html"}`. The registry supports `crossfade`, `blur-crossfade`, `push-slide`, `zoom-through` and `squeeze`; `cut`, `none` or empty is a hard cut. Direction/duration modifiers are allowed. Injection pads the outgoing wrapper and its internal duration, alternates overlap lanes and stamps the paused main timeline without shifting starts or voice/caption/BGM/SFX timing. Verification must pass before checks.

`frames.lint {"project": "/absolute/path/to/project"}`

`frames.check {"project": "/absolute/path/to/project"}`

`frames.snapshot {"project": "/absolute/path/to/project", "at": [0.5, 1.5, 3.0]}`

`snapshot` stitches the captured frames into one contact sheet (`snapshots/contact-sheet.jpg`). Glance at it; if nothing is obviously broken, move on - don't linger here.

If a command fails, surface stderr and stop - don't pile on recovery commands. Fix it yourself: the cheapest safe edit to `compositions/frames/NN-*.html`, then rerun the failed check.

**Known false-positive - do not chase it.** `check` may report a handful of `text_box_overflow` findings of ~1–4px on the **caption** highlight words (selector `#caption-word-*` / `.caption-line`). The caption pill uses a deliberately snug `line-height` and has **no `overflow:hidden`**, so a heavy display glyph's ink spills a few px into the pill's own padding - nothing is actually clipped. Treat these as expected and proceed. Do **not** inflate the caption `line-height` (it balloons the pill, which is worse). Only act on a `text_box_overflow` when it names a **frame** element (`#el-NN-*`), not a caption word.

After checks pass, pause for user review - the review loop's final look (`review-loop.md` § 4): one question, on the final live preview - render now, or what changes? (Autonomous: the one kept question, preview first or render.) Then deliver the MP4 with the contact sheet and the frame ids so revisions can target a single frame.

Preview: `frames.preview {"project": "/absolute/path/to/project"}`

Render only after user approval (autonomous mode: after the preview-or-render question):

`frames.render {"project": "/absolute/path/to/project", "quality": "high", "output": "renders/video.mp4"}`

Do not rerun `lint`, `check`, or `snapshot` after rendering unless the user asks.

**Gate:** `lint` and `check` passed and the snapshots were inspected before render; user approved at the review pause (autonomous: checks passed and the delivery includes the contact sheet); `renders/video.mp4` exists. Final reply states MP4 path and final duration.

---

## Quick Reference

**Formats:** landscape `1920x1080`; portrait `1080x1920`; square `1080x1080` - derived from the destination (brief contract § 2). Set the format once in the storyboard frontmatter.

**Faceless deltas vs a captured-asset workflow:** no Step 1 capture (synthetic `tokens.json` + `visible-text.txt`); no `asset-descriptions.md` and no `capture/assets/`; no asset-staging in Step 4; `asset_candidates` empty by default; every visual is invented by the Step 5 workers (typography / abstract graphics / diagrams / data-viz). A user-supplied `public/<basename>` image is the only real asset path.

**Workflow tools:** `frames.storyboard`, `frames.build_frame`, `frames.narrate` (`generate`, `sync-durations`, `fetch-sfx`), `frames.frame_packets`, `frames.captions`, `frames.assemble` and `frames.transitions` replace upstream helpers. Pass the explicit `faceless-explainer` mode and project root; hyphenated CLI flags become snake_case fields. These local workflow tools do not enable hosted media catalogs, authentication or remote mutations.

The reusable, domain-agnostic shot shapes live in `animation/blueprints` (indexed by `animation/blueprints-index.md`).

| Read                                                                                                                                                        | When                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `[brief-contract.md](brief-contract.md)`                                                                | Gate types, mode derivation from `BRIEF.md`, field semantics.                                            |
| `[creative/references/story-spine.md](creative/references/story-spine.md)`                                                    | Step 3: story doctrine - hook language, value-before-evidence, proposal shape, source-traceable visuals. |
| `[creative/frame-presets](creative/frame-presets)`                                                                          | Step 2: choose and adopt a frame preset.                                                                 |
| `[creative/references/design-spec.md](creative/references/design-spec.md)`                                                    | Step 2: apply brand tokens correctly.                                                                    |
| `[faceless-explainer/references/story-design.md](faceless-explainer/references/story-design.md)`                                                                                                  | Step 3: plan the explainer story.                                                                        |
| `[animation/blueprints-index.md](animation/blueprints-index.md)`                                                              | Step 3: role→blueprint menu. Step 4: pick the shot shape.                                                |
| `[storyboard-format.md](storyboard-format.md)`                                                          | Step 3: write `STORYBOARD.md`.                                                                           |
| `[script-format.md](script-format.md)`                                                                  | Step 3: write `SCRIPT.md`.                                                                               |
| `[media-use/audio/references/tts.md](media-use/audio/references/tts.md)`                                                                              | Step 3.1: choose or understand TTS providers and voices.                                                 |
| `[faceless-explainer/references/visual-design.md](faceless-explainer/references/visual-design.md)`                                                                                                | Step 4: write the frame's shot sequence (+ Layout vocabulary).                                           |
| `[faceless-explainer/references/motion-language.md](faceless-explainer/references/motion-language.md)`                                                                                            | Step 4: the motion vocabulary + the motion doctrine.                                                     |
| `[faceless-explainer/references/cut-catalog.md](faceless-explainer/references/cut-catalog.md)`                                                                                                    | Step 4-5: the cut catalog (worker builds within-frame seams).                                            |
| `[animation/rules-index.md](animation/rules-index.md)` + `[animation/rules](animation/rules)` | Step 5: local rule recipe bodies for the cited motions.                                                  |
| `[frame-worker-core.md](frame-worker-core.md)`                                                          | Step 5: the shared worker contract (packet builder prepends it to the delta).                            |
| `[faceless-explainer/sub-agents/frame-worker.md](faceless-explainer/sub-agents/frame-worker.md)`                                                                                                  | Step 5: the workflow's frame-worker delta.                                                               |
| `[subagent-dispatch.md](subagent-dispatch.md)`                                                          | Step 5: dispatch faceless-explainer/sub-agents safely.                                                                      |
