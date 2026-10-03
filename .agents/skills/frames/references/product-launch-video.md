<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/product-launch-video/SKILL.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->


The frames skill and its references ship with Numen and are projected by `numen sync`; read the ported skill files directly.

HeyGen-hosted audio, avatars and authentication, and media-use asset/catalog resolution are unavailable in Numen; use local narration and user-supplied music, SFX, images and logos.

Figma import is unavailable in Numen; use screenshots, exports and brand tokens supplied by the user instead.

# Product Launch to HyperFrames

Use this skill to capture a product, understand its brand, plan a launch video, and build it frame by frame in HyperFrames.

> **The front door is `/frames`.** You are the orchestrator. Run each step, verify its gate, and only then continue to the next step. This skill is for a **product being marketed, launched, promoted, or revealed**, including requests such as "promo for our site" when the purpose is promotional. A site tour / showcase ask stays here too: `BRIEF.md` carries the show-it-as-is intent, and the captured screens become the assets the video features. Any other intent, a bare "make a video", or any uncertainty → read `/frames` first - the intent layer owns every route decision, and a fresh creation arriving here without `BRIEF.md` goes through it anyway (Setup's opening rule).

You are the orchestrator. Work in `videos/<project>/`. Run steps in order and pass each gate before continuing. User-gated steps are Step 0, Step 3, and Step 6. Read `brief-contract.md` before Step 0 - it defines the gate types and how `BRIEF.md`'s `flow`/`storyboard` derive the mode that governs the Step 3/4/6 gates. Do every step yourself except Step 5, where you dispatch one sub-agent per frame. Do not put design or motion rules here; those live in the frame-worker sub-agent, this skill's local `animation/rules` + `animation/blueprints`, and `frames references/creative.md`.

Workflow: Step 0 setup -> `hyperframes.json`; Step 1 capture -> `capture/`; Step 2 design system -> `frame.md`; Step 3 storyboard/script -> `STORYBOARD.md` and `SCRIPT.md`; Step 3.1 audio -> `audio_meta.json`; Step 4 visual design -> enriched `STORYBOARD.md`; Step 5 frames -> `compositions/frames/NN-*.html` and `index.html`; Step 6 final render -> `renders/video.mp4`.

---

## Step 0: Setup

Goal: Enter with a confirmed brief, create the HyperFrames project, and make the brief durable.

**The brief is confirmed by the intent layer, not by questions asked here.** Opening rule, in order: **(1)** `BRIEF.md` exists → read it and ask nothing - the brief is settled, and its `flow`/`storyboard` derive the mode (brief contract § 1). **(2)** No `BRIEF.md` but the project exists (`hyperframes.json` / `STORYBOARD.md` on disk) → resume from the storyboard's frontmatter and the recorded preferences; never re-interrogate a half-built project. **(3)** Neither - a fresh creation request that arrived here directly → read `/frames` and run its intent layer (`intent-interview.md`): it checks recipes and remembered defaults, conducts this route's questions (`routes/product-launch-video.md`), and hands back the locked brief. Edit requests skip all of this - go do the edit.

Initialize only if `hyperframes.json` is missing. Name `<project>` from the brand or domain in kebab-case, such as `acme-promo`; never use workspace name or timestamp.

`frames.init {"project": "/absolute/path/to/project"}` initializes a blank project; it does not update skills from GitHub.

After init, let `<PROJECT_ROOT>` be `videos/<project>` and run every subsequent relative-path command with that directory as its working directory. In the commands below, `.` means `<PROJECT_ROOT>`; never write `.media`, `capture`, or output files in the caller directory.

**Write `BRIEF.md` immediately after init**: the intent layer's locked brief, shape per `brief-format.md`. Record preference-backed answers there. If an existing user-supplied recipe was adopted, copy its `frame.md` and use its storyboard skeletons; skip Step 2. A recipe fills answers, not approvals; review gates still run.

**Gate:** `hyperframes.json` and `BRIEF.md` exist; the preference-backed answers are recorded in the brief.

---

## Step 1: Capture assets

Goal: Collect the source material, brand signals, and usable assets for the video.

Classify the input and choose the path. Explicit URL -> capture it and use the site for narration and assets. Pasted script/brief -> save verbatim as `user_script.txt`; `VO_MODE` (verbatim or restructured) comes from `BRIEF.md` - the intent layer asks it when a script arrives (ask once here only if the brief somehow lacks it). Then resolve capture target: URL in text -> use it; brand name only -> `WebSearch`, confirm URL in one line, then crawl; no URL/site (or the brief says don't scrape) -> no-capture path.

Run capture with: `frames.capture {"project": "/absolute/path/to/project", "url": "<URL>", "output": "./capture"}`. Keep the default
post-navigation budget unless the caller owns a smaller deadline; then pass a positive
`--capture-budget <milliseconds>` that leaves time for downstream work. `--timeout` controls page
navigation only. Use `--skip-vision` only when optional image captioning is intentionally disabled.

Inspect the command result and output directory immediately. A non-zero exit, JSON `ok: false`, or
`capture/BLOCKED.md` is a **hard stop** for the capture path: report the recorded reason and do not
consume partial screenshots, DOM, tokens, or assets. Do not manufacture a synthetic no-capture
fallback after a failed URL capture. Continue through the no-capture path only when the original
brief supplied the source material, or when the user explicitly switches to a provided screenshot
or brief after the failure.

Warnings such as `very little text content` together with an empty asset catalog are not proof of a
usable page. For a site tour or show-it-as-is brief, require trustworthy captured structure or a
provided screenshot; if neither exists, stop. Do not invent or rebuild the page merely because the
capture is unusable.

For a site tour or show-it-as-is brief, the captured page is the visual source of truth. Use the real screenshot instead of rebuilding the full website in HTML. If the shot needs internal movement, keep the screenshot as the base and overlay real captured assets at measured positions, or rebuild only the one component that moves. For a scroll shot, animate the viewport over `capture/screenshots/full-page.png` - the 1x plate of the whole document, pixel-exact for a 1920-wide viewport travelling down it. It is absent when the page was too tall to capture in one piece; fall back to the overlapping scroll-position shots in the same directory. Pushing in past 1:1 wants its own 2x capture of that region instead, since the plate has no headroom above 1x. Recreate the whole page only when the user explicitly asks for a stylized interpretation; an unusable capture alone is not authorization.

If `GEMINI_API_KEY`, `GOOGLE_API_KEY`, or an OpenRouter key exists, capture auto-captions assets into `capture/extracted/asset-descriptions.md`. This is not a review gate. Without a vision key, use DOM context and continue.

No-capture path: create `capture/extracted/tokens.json`, `capture/extracted/visible-text.txt`, `capture/extracted/asset-descriptions.md`, and `capture/assets/` by hand. `tokens.json` should be `{ "title": "", "description": "", "colors": [], "fonts": [] }`; fill title/description from the brief when possible. `visible-text.txt` contains the full brief or script. `asset-descriptions.md` should say no assets were captured unless the user gave asset notes.

**Gate:** capture JSON reported `ok: true`; `capture/BLOCKED.md` does not exist;
`capture/extracted/tokens.json`, `capture/extracted/visible-text.txt`,
`capture/extracted/asset-descriptions.md`, and `capture/assets/` exist; and you can state the brand in
one clear sentence. Treat `asset-descriptions.md` as the main asset inventory. If it is missing after
real capture, stop and report capture incomplete. Warnings about a degraded optional phase are
acceptable only when this structural gate still passes.

---

## Step 2: Design System

Goal: Choose one shipped frame preset and adopt it as this video's `frame.md` + caption skin.

When `BRIEF.md` names a `style_preset`, use it; otherwise read `creative/references/design-spec.md` and choose the preset fitting the brand and brief. Call `frames.build_frame {"project": "/absolute/path/to/project", "mode": "product-launch-video", "preset": "<preset>", "tokens": "capture/extracted/tokens.json"}` to write `frame.md` and stage the supplied caption skin and captured local fonts. The tool remixes ink/canvas and accent roles using captured tokens, preserves semantic status colors, geometry/components and keys, maps brand font families, preserves captured font descriptors and checks contrast. Empty tokens retain the corresponding preset design. Check caption token mapping; do not hand-edit unrelated preset parts.

**Gate:** `frame.md` exists from a named preset, its supplied caption skin is staged, and the chosen preset is recorded in `BRIEF.md`.

---

## Step 3: Storyboard and Script

Goal: Turn the brief and captured material into an approved frame-by-frame story plan.

Read `creative/references/story-spine.md` (hook language, value-before-evidence, storyboard-as-proposal, source-traceable visuals), `product-launch-video/references/story-design.md`, `animation/blueprints-index.md`, `storyboard-format.md`, and `script-format.md`. Use them to write `STORYBOARD.md` and, when narration is needed, `SCRIPT.md`. Set the frontmatter `duration:` from the brief's `length` - a rough expectation; assembly reports where the cut lands against it.

Use `story-design.md` for story blueprint, hook, persuasion logic, beats, `VO_MODE`, and asset choices. As a **soft guide**, consult the role→blueprint menu in `animation/blueprints-index.md`: for each beat, note a candidate blueprint id when one fits. Story truth still decides which beats exist - never force a beat to fit a blueprint, and never invent a beat just because a proven shape is available. Choose each visual frame's `asset_candidates` from `capture/extracted/asset-descriptions.md` (the canonical inventory) - don't browse raw `capture/assets/`. Do not ask the user to pick assets unless that inventory is missing or unusable. Use the exact required fields from the storyboard and script references.

Parse the draft with `frames.storyboard {"project": "/absolute/path/to/project", "mode": "product-launch-video", "storyboard": "STORYBOARD.md"}` and resolve malformed fields before review. The tool reads the authored plan; it does not replace narrative design or captured-source grounding.

After drafting, run the review loop's plan pass - `review-loop.md` § 1: present the plan as a proposal, and ask the two questions - approve or change, and **sketches first** (recommended) or skip. Feedback arrives as a chat reply; loop until approved. This is a **checkpoint gate** (brief contract § 1): in autonomous mode there is nothing to ask - post the same summary as a heads-up and proceed; sketches collapse into the build, and the one preview question comes at Step 6.

**Gate:** `STORYBOARD.md` exists, every visual frame has `asset_candidates`, `SCRIPT.md` exists when narration is needed, and the user approved the frame-by-frame plan (autonomous: the summary was posted as a heads-up).

---

## Step 3.1: Audio

Goal: Generate narration, word timings, music, and audio metadata from the approved script.

Narration uses the host's configured Numen voice engine, not a provider login or voice download. Optional `bgm` names supplied local audio; `sfx_library` names a supplied local SFX manifest and audio directory for the later pass.

Start audio after Step 3 approval, alongside Step 4 when background calls are supported. **Numen has one voice, `numen`.** If another voice, gender or tone was requested, say it is unavailable and offer a recorded take instead. Call `frames.narrate {"project": "/absolute/path/to/project", "mode": "product-launch-video", "command": "generate", "script": "SCRIPT.md", "storyboard": "STORYBOARD.md", "out": "audio_meta.json", "voice": "numen", "speed": 1.0}` to generate, normalize and transcribe narration and write measured voice durations/word timings. Use only supplied BGM/SFX; hosted music lookup remains excluded.

**The canonical fully-silent marker:** `music: none` in the STORYBOARD.md top YAML block **and** no `SCRIPT.md`: no narration, BGM or SFX. Remove stale `audio_meta.json` in that case; absent metadata means silent assembly. `music: none` with narration turns only BGM off.

**Gate:** audio job has started, or the project is marked silent (`music: none` + no `SCRIPT.md`).

---

## Step 4: Frame Visual Design

Goal: Add the visual direction, layout intent, and motion choices to each storyboard frame.

**Sketch the storyboard sheet first (collaborative only).** The moment the plan is approved, run the sketch pass - `review-loop.md` § 2 (don't wait on Step 3.1; sketches don't use timings): wireframe every frame yourself as a cell of `storyboard.html` (`creative/references/storyboard-recipe.md` § 3), mark each `built`, pause for the one layout question when every frame is `built`, and revise only the sketches named until the sheet is confirmed. Stand-ins: plain labeled blocks for the captured assets - the real files arrive with Step 5's workers. Only then write the visual design below onto the confirmed layouts. In autonomous mode, or when the user chose to skip sketches at Step 3, skip this pass - frames go straight from `outline` to `animated` at Step 5.

Edit `STORYBOARD.md` in place. Do not create another storyboard. Use `frame.md` as source of truth for color, type, layout feel, and style.

Read `product-launch-video/references/visual-design.md`, `animation/blueprints-index.md`, `product-launch-video/references/motion-language.md`, and `animation/rules-index.md`. Use `visual-design.md` for the method (the time-coded shot sequence, the inline Layout vocabulary, and the required `## Video direction` block). Use `animation/blueprints-index.md` to pick each frame's shot shape. Use `motion-language.md` (the motion vocabulary + the motion doctrine) and `animation/rules-index.md` (valid rule names) for motion - do not invent motion names.

**Search the live catalog before you design any named look.** For every look, effect, treatment or transition the brief names - "CRT scanlines", "glitch", "film grain", "shimmer sweep", "confetti burst" - run `frames.catalog {"query": "<the look, in plain English>"}` and read the top results BEFORE you write that look into `STORYBOARD.md`. The search needs **nothing installed**: no project, no prior `add`, no account. It searches Numen's local catalog registry. A block that already does the job becomes the frame's `focal` - name it here, so Step 5's workers install and customize it instead of rebuilding it. Hand-author a look only after a search for it came back with nothing that fits.

For every visual frame, write a **time-coded shot sequence** into `STORYBOARD.md` per `visual-design.md`'s method: pick the frame's blueprint (or compose), instantiate it with THIS product's content, and pace each Scene's reveal to the voiceover so the frame develops across its full duration instead of front-loading then freezing. State layout and motion **inline** per Scene (vocabularies in `visual-design.md` and `motion-language.md`). Add one video-wide `## Video direction` block.

When an element visibly continues across a frame boundary, give both workers the same numerical handoff in `STORYBOARD.md`: add `handoff_out:` to the outgoing frame and a matching `handoff_in:` to the incoming frame. Name the element and its exact x/y position, scale, opacity, and motion direction/speed at the cut - state every field even when it does not change, because a constant is `opacity: 1`, not an omission. Omit the whole block only for a deliberate clean cut. The goal is simple: parallel workers must not invent two different versions of the same seam.

Do not change story, script, asset choices, `asset_candidates`, `transition_in`, or captured source material. Do not write HTML in this step.

Stage named assets after visual design is locked:

Call `frames.stage_assets {"project": "/absolute/path/to/project", "mode": "product-launch-video", "storyboard": "STORYBOARD.md"}`. It stages named `asset_candidates` basenames from captured assets, videos, SVGs and screenshots into `assets/`, preserving existing destinations (first wins). Report missing sources rather than creating broken references.

**Gate:** every visual frame has a time-coded shot sequence whose reveals are paced to the voiceover (no front-loading); `## Video direction` exists; `assets/` contains the named assets. Collaborative: the sketch sheet was confirmed.

---

## Step 5: Build Frames

Goal: Build every storyboard frame as an HTML composition and assemble the playable video.

Wait for Step 3.1 audio to finish if audio was started. Then sync durations and fetch SFX; skip both if silent.

Call `frames.narrate {"project": "/absolute/path/to/project", "mode": "product-launch-video", "command": "sync-durations", "audio_meta": "audio_meta.json", "storyboard": "STORYBOARD.md"}`, then `frames.narrate {"project": "/absolute/path/to/project", "mode": "product-launch-video", "command": "fetch-sfx", "audio_meta": "audio_meta.json", "storyboard": "STORYBOARD.md"}` after storyboard cues exist. Real voice durations replace estimates without an estimated tail; silent frames retain estimates. Supplied local SFX merge without replacing voice/BGM metadata. Never change measured timing to fit an estimate.

Check the music against the final cut before assembly. A library track can match the requested mood but open on a quiet build that drains the first seconds of a short launch video. Compare the opening with later five-second sections; when a later section has a stronger, musically clean start, trim from there and keep a short fade-in plus a longer fade-out. If frame or narration timing changes, redo this check against the new final duration so the music never ends early or leaves silence at the tail.

Before dispatch, read `subagent-dispatch.md`. Build the per-frame packets and the worker role payload:

Call `frames.frame_packets {"project": "/absolute/path/to/project", "mode": "product-launch-video", "storyboard": "STORYBOARD.md", "out_dir": ".hyperframes/frame-packets"}` to write exact frame blocks, selected blueprint bodies, cited motion recipes and project/design paths into bounded packets, plus `_role.md` from shared worker core and workflow delta. The 48,000-byte bound remains a gate; select less context rather than truncate source.

Dispatch one sub-agent per frame, in parallel if possible or in waves. Each receives `_role.md`, its one packet and dispatch context with `PROJECT_DIR`, `frame_id`, confirmed-sketch status and `RULES_DIR`. Pass only that frame's confirmed sketch cell, never the whole storyboard sheet.

Workers read only their packet and `frame.md`; they never open `STORYBOARD.md` or the skill documents (the packet inlines what was selected upstream). Each worker writes only `compositions/frames/NN-*.html`. Workers must never edit `STORYBOARD.md`.

**Full-bleed backgrounds ride on a `class="clip"` layer, never the `#root`.** A frame's ground (color field / gradient / grid) is its own full-duration background clip - a `background` set on the `#root` / `data-composition-id` element is clip-gated to the frame's window and is not a dependable ground, so dark content can land on the black host `body` and render invisible. The video's base ground is painted by the assembler from `frame.md`'s `canvas` color onto the index `#root`. (Full rule + self-check: `frame-worker-core.md`.)

As each worker returns, the orchestrator marks that frame as `animated` in `STORYBOARD.md`.

After audio timings exist, build captions in the background and assemble the index:

Call `frames.captions {"project": "/absolute/path/to/project", "mode": "product-launch-video", "command": "build", "storyboard": "STORYBOARD.md", "audio_meta": "audio_meta.json", "out": "caption_groups.json"}` to build absolute-time groups and seek-safe caption HTML using the project skin and `frame.md` tokens. Skip explicitly when disabled or no narration words exist.

Call `frames.assemble {"project": "/absolute/path/to/project", "mode": "product-launch-video", "storyboard": "STORYBOARD.md", "audio_meta": "audio_meta.json"}`. It validates nonempty matching-id frames and positive durations, mounts ordered frames on track 1, captions on 2, voices on 10, BGM on 11 and SFX on 20+, paints the root canvas, declares dimensions/duration and registers a paused main timeline. Only approved frame-local videos are hoisted to index-owned mounts at frame-adjusted offsets; voice/SFX remain index-owned. Supplied BGM covers the cut with fades at volume 0.12 under narration or 0.9 without it. Absent metadata yields silent assembly; pending BGM blocks unless `allow_pending_bgm: true` deliberately requests a silent preview.

**Gate:** every frame is marked `animated` (collaborative: the sketch sheet was confirmed at Step 4), `index.html` exists, and captions are built or explicitly skipped.

---

## Step 6: Finalize

Goal: Verify the assembled video, get user approval, and render the final MP4.

Inject transitions, run checks, pause for review, then render.

Call `frames.transitions {"project": "/absolute/path/to/project", "mode": "product-launch-video", "command": "inject", "storyboard": "STORYBOARD.md"}`, then `frames.transitions {"project": "/absolute/path/to/project", "mode": "product-launch-video", "command": "verify", "storyboard": "STORYBOARD.md", "index": "index.html"}`. Registered recipes pad only outgoing wrapper/internal durations and alternate overlap lanes without shifting starts or voice/caption/SFX timing. `cut`, `none` or empty stays a hard cut. Verification must pass before checks.

`frames.lint`

`frames.check`

`frames.snapshot {"project": "/absolute/path/to/project", "at": [0.5, 1.5, 3.0]}`

`snapshot` stitches the captured frames into one contact sheet (`snapshots/contact-sheet.jpg`). Inspect the midpoint frames for layout failures, then compare the two images around every cut. A continuing element must keep the promised position, scale, opacity, and direction; fix any visible pop before rendering.

If a command fails, surface stderr and stop - don't pile on recovery commands. Fix it yourself: the cheapest safe edit to `compositions/frames/NN-*.html`, then rerun the failed check.

After checks pass, pause for user review - the review loop's final look (`review-loop.md` § 4): one question, on the final live preview - render now, or what changes? (Autonomous: the one kept question, preview first or render.) Then deliver the MP4 with the contact sheet and the frame ids so revisions can target a single frame.

Preview: `frames.preview`

Render only after user approval (autonomous mode: after the preview-or-render question):

`frames.render {"project": "/absolute/path/to/project", "quality": "high", "output": "renders/video.mp4"}`

Do not rerun `lint`, `check`, or `snapshot` after rendering unless the user asks.

**Gate:** `lint` and `check` passed and the snapshots were inspected before render; user approved at the review pause (autonomous: checks passed and the delivery includes the contact sheet); `renders/video.mp4` exists. Final reply states MP4 path and final duration.

---

## Quick Reference

**Formats:** landscape `1920x1080`; portrait `1080x1920`; square `1080x1080` - derived from the destination (brief contract § 2). Set the format once in the storyboard frontmatter.

**Workflow tools:** `frames.storyboard`, `frames.build_frame`, `frames.narrate` (`generate`, `sync-durations`, `fetch-sfx`), `frames.stage_assets`, `frames.frame_packets`, `frames.captions`, `frames.transitions` and `frames.assemble` replace upstream helpers. Pass explicit `product-launch-video` mode and project root; CLI flag names become snake_case fields. Hosted catalogs/authentication and remote mutations remain excluded.

The reusable, product-agnostic shot shapes live in `animation/blueprints` (indexed by `animation/blueprints-index.md`).

| Read                                                                                                                                                        | When                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `[brief-contract.md](brief-contract.md)`                                                                | Gate types, mode derivation from `BRIEF.md`, field semantics.                                            |
| `[creative/references/story-spine.md](creative/references/story-spine.md)`                                                    | Step 3: story doctrine - hook language, value-before-evidence, proposal shape, source-traceable visuals. |
| `[creative/frame-presets](creative/frame-presets)`                                                                          | Step 2: choose and adopt a frame preset.                                                                 |
| `[creative/references/design-spec.md](creative/references/design-spec.md)`                                                    | Step 2: apply brand tokens correctly.                                                                    |
| `[product-launch-video/references/story-design.md](product-launch-video/references/story-design.md)`                                                                                                  | Step 3: plan the product-launch story.                                                                   |
| `[animation/blueprints-index.md](animation/blueprints-index.md)`                                                              | Step 3: role→blueprint menu. Step 4: pick the shot shape.                                                |
| `[storyboard-format.md](storyboard-format.md)`                                                          | Step 3: write `STORYBOARD.md`.                                                                           |
| `[script-format.md](script-format.md)`                                                                  | Step 3: write `SCRIPT.md`.                                                                               |
| `[media-use/audio/references/tts.md](media-use/audio/references/tts.md)`                                                                              | Step 3.1: choose or understand TTS providers and voices.                                                 |
| `[product-launch-video/references/visual-design.md](product-launch-video/references/visual-design.md)`                                                                                                | Step 4: write the frame's shot sequence (+ Layout vocabulary).                                           |
| `[product-launch-video/references/motion-language.md](product-launch-video/references/motion-language.md)`                                                                                            | Step 4: the motion vocabulary + the motion doctrine.                                                     |
| `[product-launch-video/references/cut-catalog.md](product-launch-video/references/cut-catalog.md)`                                                                                                    | Step 4-5: the cut catalog (worker builds within-frame seams).                                            |
| `[animation/rules-index.md](animation/rules-index.md)` + `[animation/rules](animation/rules)` | Step 5: local rule recipe bodies for the cited motions.                                                  |
| `[frame-worker-core.md](frame-worker-core.md)`                                                          | Step 5: the shared worker contract (packet builder prepends it to the delta).                            |
| `[product-launch-video/sub-agents/frame-worker.md](product-launch-video/sub-agents/frame-worker.md)`                                                                                                  | Step 5: the workflow's frame-worker delta.                                                               |
| `[subagent-dispatch.md](subagent-dispatch.md)`                                                          | Step 5: dispatch product-launch-video/sub-agents safely.                                                                      |
