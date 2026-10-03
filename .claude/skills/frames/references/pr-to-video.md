<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/pr-to-video/SKILL.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->


The frames skill and its references ship with Numen and are projected by `numen sync`; read the ported skill files directly.

HeyGen-hosted audio, avatar services and authentication, and media-use catalog resolution are unavailable in Numen; use local narration and user-supplied music, SFX, images and logos. Read-only public GitHub contributor-avatar downloads are available through `frames.fetch_avatars`.

# PR to HyperFrames

Use this skill to ingest a GitHub pull request, understand the change, plan a code-change explainer, and build it frame by frame in HyperFrames. The input is a **code change** (read via `gh`), not a website - there is **no capture step and no real assets** beyond the contributors' avatars.

> **The front door is `/frames`.** You are the orchestrator. Run each step, verify its gate, and only then continue. This skill is for a **GitHub pull request** (a code change). Any other intent, a bare "make a video", or any uncertainty → read `/frames` first - the intent layer owns every route decision, and a fresh creation arriving here without `BRIEF.md` goes through it anyway (Setup's opening rule).

You are the orchestrator. Work in the resolved external `PROJECT_DIR`, never in the caller repository by default. Run steps in order and pass each gate before continuing. User-gated steps are Step 0, Step 3, and Step 6. Read `brief-contract.md` before Step 0 - it defines the gate types and how `BRIEF.md`'s `flow`/`storyboard` derive the mode that governs the Step 3/4/6 gates. Do every step yourself except Step 5, where you dispatch a bounded pool of frame workers. Do not put design or motion rules here; those live in the frame-worker sub-agent, this skill's local `animation/rules` + `animation/blueprints`, and `frames references/creative.md`.

Workflow: Step 0 setup → `hyperframes.json`; Step 1 ingest → `capture/extracted/` + `assets/<login>.png`; Step 2 design system → `frame.md`; Step 3 storyboard/script → `STORYBOARD.md` and `SCRIPT.md`; Step 3.1 audio → `audio_meta.json`; Step 4 visual design → enriched `STORYBOARD.md`; Step 5 frames → `compositions/frames/NN-*.html` and `index.html`; Step 6 final render → `renders/video.mp4`.

---

## Step 0: Setup

Goal: Enter with a confirmed brief - including the **PR reference** (a full URL, an `<owner>/<repo>#<N>` ref, or "this PR" in a checked-out repo) - create the HyperFrames project, and make the brief durable. The style is always **code-editorial** (fixed at Step 2, never asked).

**The brief is confirmed by the intent layer, not by questions asked here.** Opening rule, in order: **(1)** `BRIEF.md` exists → read it and ask nothing - the brief is settled, and its `flow`/`storyboard` derive the mode (brief contract § 1). **(2)** No `BRIEF.md` but the project exists (`hyperframes.json` / `STORYBOARD.md` on disk) → resume from the storyboard's frontmatter and the recorded preferences; never re-interrogate a half-built project. **(3)** Neither - a fresh creation request that arrived here directly → read `/frames` and run its intent layer (`intent-interview.md`): it checks recipes and remembered defaults, and conducts this route's questions - including the PR-size → length doctrine, which lives whole in `routes/pr-to-video.md` - then hands back the locked brief. Edit requests skip all of this - go do the edit.

For "this PR" or a bare number, resolve the canonical PR URL with read-only `gh pr view --json url` in the caller checkout (pass the number when supplied). Resolve `PROJECT_DIR` with `frames.fetch_pr {"project": "/absolute/path/to/project", "mode": "pr-to-video", "command": "project-dir", "pr": "<URL|owner/repo#N>"}`. Preserve an explicitly supplied `project_dir`; an empty project selects `PR_TO_VIDEO_PROJECT_DIR` when configured, otherwise the returned `${XDG_CACHE_HOME:-$HOME/.cache}/numen/frames/pr-to-video/<owner>/<repo>/<repo>-pr-<N>` cache directory. Never create `videos/` in the caller repository.

Before fetching or planning, confirm that `frames.check` is exposed; `frames.doctor {"project": "/absolute/path/to/project", "mode": "pr-to-video", "require_github": true, "pr": "<URL|owner/repo#N>"}` diagnoses native prerequisites. If a required capability is missing, report the prerequisite and stop.

Initialize only if `$PROJECT_DIR/hyperframes.json` is missing. Its basename comes from the PR, such as `acme-sdk-pr-1842`; never use the workspace name or a timestamp.

`frames.init {"project": "/absolute/path/to/project"}` initializes the blank project; it does not update skills from GitHub.

Every relative-path command below runs with `$PROJECT_DIR` as its working directory. Examples without an explicit subshell mean `(cd "$PROJECT_DIR" && …)`; never change the caller repository's working tree.

**Write `BRIEF.md` immediately after init**: the intent layer's locked brief, shape per `brief-format.md`. Record preference-backed answers in the brief. If an existing user-supplied recipe was adopted, copy its `frame.md` and use its skeletons for Step 3; skip Step 2. A recipe fills answers, not approvals; review gates still run.

**Gate:** `hyperframes.json` and `BRIEF.md` exist; the PR ref and preference-backed answers are captured in the brief.

---

## Step 1: Ingest the PR (no capture)

Goal: Fetch the PR's facts using read-only `gh`/`jj` access and ingest them as the source of information. There is **no website capture**.

Run `frames.fetch_pr {"project": "/absolute/path/to/project", "mode": "pr-to-video", "command": "preflight", "pr": "<URL|owner/repo#N>"}` before ingest. Then call `frames.fetch_pr {"project": "/absolute/path/to/project", "mode": "pr-to-video", "command": "fetch", "pr": "<URL|owner/repo#N>", "out_dir": "capture"}`. Fetch saves PR facts and the diff, completes paginated changed files, records best-effort shipped-version metadata with its evidence source, and ingests synthetic tokens, the bounded narrative brief with real representative hunks and deduplicated human contributor/reviewer/commenter/assignee metadata. Preserve omissions and the full diff; never fabricate contents. Surface authentication/private-repository/not-found failures and stop. For saved artifacts instead of a remote fetch, call `frames.fetch_pr {"project": "/absolute/path/to/project", "mode": "pr-to-video", "command": "ingest", "pr_json": "capture/pr.json", "diff": "capture/diff.patch", "out_dir": "capture"}`; `out_dir` is the capture root and the tool writes its `extracted/` child. Inspect warnings about incomplete remote data before narrating it; release-date/default-branch version heuristics are not proof a tag contains the merge.

Call `frames.fetch_avatars {"project": "/absolute/path/to/project", "mode": "pr-to-video", "people": "capture/extracted/people.json", "timeout": 8000}` for best-effort public GitHub avatar downloads. It stages `assets/<login>.png` and updates `avatarFetched`; supplied local avatars are also valid. Missing avatars never block the video or justify fabricated portraits.

**Hard exclusions:** these tools may read PRs, public profiles/avatars and local revision metadata, and write only project artifacts. Never create/edit/comment/review/merge/close a PR, push, modify remote state, check out or mutate the caller's working tree.

`people.json` carries a `name` for whichever contributors `gh` already named (the PR author, commit authors, `mergedBy`) - `null` for the rest (reviewers/commenters/assignees, which `gh pr view` only ever gives a bare `login`). Before writing the credits close in Step 3, resolve any `null` name yourself for the 1-6 people who'll actually appear on that frame: `gh api users/<login> --jq .name` (you already have `gh` - no need to script this). If GitHub has no public name for that user either, fall back to the login on-screen and drop that person from the spoken line (see story-design.md's credits section - the voiceover must still say names, never raw handles).

**Gate:** `capture/pr.json`, `capture/diff.patch`, `capture/extracted/tokens.json`, `capture/extracted/visible-text.txt`, and `capture/extracted/people.json` exist; you can state the PR's change in one clear sentence. `assets/<login>.png` is best-effort - its absence is not a failure.

---

## Step 2: Design System

Goal: Adopt the code-editorial preset as this video's `frame.md` + caption skin.

Call `frames.build_frame {"project": "/absolute/path/to/project", "mode": "pr-to-video", "preset": "code-editorial", "tokens": "capture/extracted/tokens.json"}` to write `frame.md` and stage its supplied caption skin and preset fonts. When the six preset WOFF2 files and their three OFL license files are absent locally, the tool downloads only those pinned upstream files from commit `73489331114b89f42b5bc843765e610525188bcb`, checks fixed SHA-256 digests, caches them under `~/.cache/numen/frames/presets/<commit>/code-editorial/fonts`, and stages them under `assets/fonts/`. This read-only download is not provider authentication or a remote mutation. Empty PR brand tokens preserve the complete palette/fonts. Review tool warnings and check caption color/font keys map to `frame.md`.

**Gate:** `frame.md` exists from the code-editorial preset, and the preset's caption skin exists when supplied.

---

## Step 3: Storyboard and Script

Goal: Turn the PR into an approved frame-by-frame explanation plan.

**Ground code before scripting.** For every symbol, file or behaviour the video shows or narrates, write a lesson spec whose steps carry `code_refs` (`{"path": "<file relative to the workspace root>", "item_path": "<module, type or method path>"}`) and pass it to `frames.init` with absolute `project` and `workspace_root` paths and the authored lesson object as `spec`. The lesson tool resolves each ref against the workspace and fails on any it cannot ground; script narration and code on screen only from the grounded source it returns. Fix or drop a ref that fails rather than narrating from memory. Fetch the relevant revision into a separate workspace when needed without modifying the caller's tree.

Read `creative/references/story-spine.md` (hook language, value-before-evidence, storyboard-as-proposal, source-traceable visuals), `pr-to-video/references/story-design.md`, `animation/blueprints-index.md`, `storyboard-format.md`, and `script-format.md`. Use them to write `STORYBOARD.md` and, when narration is needed, `SCRIPT.md`. Set the frontmatter `duration:` from the brief's `length` - a rough expectation; assembly reports where the cut lands against it.

Use `story-design.md` for the PR archetype (changelog / feature-reveal / fix-explainer / refactor-walkthrough), the PR-native frame types, hook, persuasion, beats, the per-frame word budget, and the credits close. The sequence comes from **narrative design, not the diff's file order** - explain the change, don't read the diff aloud. As a **soft guide**, consult the role→blueprint menu in `animation/blueprints-index.md`: for each beat, write the voiceover in the shape its candidate blueprint implies and tag that candidate `blueprint:` id when one fits (story truth still decides which beats exist - never force a beat to fit a shape). Feature 2–4 real diff hunks (from `capture/diff.patch`), each a small legible snippet; name the `code-*` block each wants in the frame's `scene`. Frames carry no `asset_candidates` except the `credits` close (1–6 `assets/<login>.png` avatars). Use the exact required fields from the storyboard and script references.
Parse the draft with `frames.storyboard {"project": "/absolute/path/to/project", "mode": "pr-to-video", "storyboard": "STORYBOARD.md"}` and resolve malformed fields before review. The tool reads the authored plan; source grounding and narrative decisions remain the orchestrator's responsibility.


After drafting, run the review loop's plan pass - `review-loop.md` § 1: present the plan as a proposal, and ask the two questions - approve or change, and **sketches first** (recommended) or skip. Feedback arrives as a chat reply; loop until approved. This is a **checkpoint gate** (brief contract § 1): in autonomous mode there is nothing to ask - post the same summary as a heads-up and proceed; sketches collapse into the build, and the one preview question comes at Step 6.

**Gate:** `STORYBOARD.md` exists, every frame has the required narrative fields, `SCRIPT.md` exists when narration is needed, and the user approved the plan (autonomous: the summary was posted as a heads-up).

---

## Step 3.1: Audio

Goal: Generate narration, word timings, music, and audio metadata from the approved script.

Narration uses the host's configured Numen voice engine, not a provider login or voice download. Optional `bgm` names supplied local audio; `sfx_library` names a supplied local SFX manifest and audio directory for the later pass.

Start audio after Step 3 approval, alongside Step 4 when background calls are supported. **Numen has one voice, `numen`.** If another voice, gender or tone was requested, say it is unavailable and offer a recorded take instead. Call `frames.narrate {"project": "/absolute/path/to/project", "mode": "pr-to-video", "command": "generate", "script": "SCRIPT.md", "storyboard": "STORYBOARD.md", "out": "audio_meta.json", "voice": "numen", "speed": 1.0}`. The tool generates, normalizes and transcribes narration and writes measured voice durations and local word timings. Use only supplied BGM/SFX; hosted music lookup remains excluded. No narration means no voice generation.

**The canonical fully-silent marker:** `music: none` in the STORYBOARD.md top YAML block **and** no `SCRIPT.md`: no narration, BGM or SFX. Remove stale `audio_meta.json` in that case; absent audio metadata means silent assembly. `music: none` with narration turns only BGM off.

**Gate:** audio job has started, or the project is marked silent (`music: none` + no `SCRIPT.md`).

---

## Step 4: Frame Visual Design

Goal: Add the visual direction, layout intent, and motion choices to each storyboard frame.

**Sketch the storyboard sheet first (collaborative only).** The moment the plan is approved, run the sketch pass - `review-loop.md` § 2 (don't wait on Step 3.1; sketches don't use timings): wireframe every frame yourself as a cell of `storyboard.html` (`creative/references/storyboard-recipe.md` § 3), mark each `built`, pause for the one layout question when every frame is `built`, and revise only the sketches named until the sheet is confirmed. Stand-ins: for a **code beat**, a plain code panel with the filename and a few real diff lines as text - the `code-*` block wiring belongs to the workers. Only then write the visual design below onto the confirmed layouts. In autonomous mode, or when the user chose to skip sketches at Step 3, skip this pass - frames go straight from `outline` to `animated` at Step 5.

Edit `STORYBOARD.md` in place. Do not create another storyboard. Use `frame.md` as source of truth for color, type, layout feel, and style.

Read `pr-to-video/references/visual-design.md`, `animation/blueprints-index.md`, `pr-to-video/references/motion-language.md`, `pr-to-video/references/code-vocabulary.md`, and `animation/rules-index.md`. Use `visual-design.md` for the method (the time-coded shot sequence, the inline Layout vocabulary, and the code-beat treatment), plus the required `## Video direction` block. Use `animation/blueprints-index.md` to pick each frame's shot shape. Use `code-vocabulary.md` to pick the right `code-*` block per code beat (diff = `code-diff`, refactor = `code-morph`, new code = `code-typing`, …). Use `motion-language.md` (the motion vocabulary + the motion doctrine) and `animation/rules-index.md` (valid rule names) for motion - do not invent motion or block/blueprint names.

**Search the live catalog before you design any named look.** `code-vocabulary.md` covers the code beats; it does not cover the rest. For every other look, effect, treatment or transition the brief names - "CRT scanlines", "glitch", "film grain", "shimmer sweep", "confetti burst" - run `frames.catalog {"query": "<the look, in plain English>"}` and read the top results BEFORE you write that look into `STORYBOARD.md`. The search needs **nothing installed**: no project, no prior `add`, no account. It searches Numen's local catalog registry. Name the block you found here; Step 5 pre-installs every block the storyboard names. Hand-author a look only after a search for it came back with nothing that fits.

For every frame, write a **time-coded shot sequence** into `STORYBOARD.md` per `visual-design.md`'s method: pick the frame's blueprint (or compose), instantiate it with THIS frame's content, and pace each Scene's reveal to the voiceover so the frame develops across its full duration instead of front-loading then freezing. **For a code beat, the `code-*` block is the frame's `focal`** and the Scenes choreograph the surrounding code-editorial Code Surface (the entry of the file/header, the camera onto the hunk, the landing line) - **not** the code animation itself, which the block owns. Immediately after each code frame's fields, add a `### Source excerpt` fenced `diff` block containing only the exact real hunk the worker must render (12 lines maximum). Select it here from `capture/diff.patch`; workers are forbidden from reopening that full diff. State layout and motion **inline** per Scene (vocabularies in `visual-design.md` and `motion-language.md`). Add one video-wide `## Video direction` block.

Do not change story, script, `transition_in`, `asset_candidates`, or the PR source. Do not write HTML in this step. There is **no asset-staging step** - the only real assets are the credits avatars, already in `assets/`.

**Gate:** every frame has a time-coded shot sequence whose reveals are paced to the voiceover (no front-loading); code frames name a `code-*` block as the `focal`; `## Video direction` exists. Collaborative: the sketch sheet was confirmed.

---

## Step 5: Build Frames

Goal: Build every storyboard frame as an HTML composition and assemble the playable video.

Wait for Step 3.1 audio to finish if audio was started. Then sync durations and fetch SFX; skip both if silent.

Call `frames.narrate {"project": "/absolute/path/to/project", "mode": "pr-to-video", "command": "sync-durations", "audio_meta": "audio_meta.json", "storyboard": "STORYBOARD.md"}`, then `frames.narrate {"project": "/absolute/path/to/project", "mode": "pr-to-video", "command": "fetch-sfx", "audio_meta": "audio_meta.json", "storyboard": "STORYBOARD.md"}` after SFX cues exist. Real voice durations replace estimates without an estimated tail; silent frames retain estimates. SFX merges supplied local cues without replacing voice/BGM metadata. Never change measured timing to fit an estimate.

**Pre-install the registry blocks** named across `STORYBOARD.md` once, before dispatch, so parallel workers don't race on the registry:

Call `frames.add {"name": "<block named in storyboard>", "project": "/absolute/path/to/project"}` once per named block.

Before dispatch, read `subagent-dispatch.md`. Build bounded packets and the worker role payload:

Call `frames.frame_packets {"project": "/absolute/path/to/project", "mode": "pr-to-video", "storyboard": "STORYBOARD.md", "out_dir": ".hyperframes/frame-packets"}` to write bounded packets and `_role.md` from the shared worker core and workflow delta. Packets inline the exact frame block, selected blueprint, cited motion recipes and project/design paths. Each code frame requires its upstream-selected `### Source excerpt` and only its selected code-vocabulary excerpt. The 48,000-byte bound remains a hard gate; shorten selected material rather than truncating source.

Dispatch **at most three workers total**, balanced across the packet paths; each prompt carries `_role.md` and its assigned paths. Workers may build multiple assigned frames sequentially, reading the role once. They read only their packets and `frame.md`, never the full storyboard or diff. Each writes only its assigned composition files; only the orchestrator edits storyboard status.

On a failed frame, re-dispatch **that frame only**, with its existing packet plus the exact validator/lint finding. One retry maximum. Do not replay a whole batch and do not retry without a concrete finding.

**Full-bleed backgrounds ride on a `class="clip"` layer, never the `#root`.** A frame's ground (color field / gradient / grid) is its own full-duration background clip - a `background` set on the `#root` / `data-composition-id` element is clip-gated to the frame's window and is not a dependable ground, so dark content can land on the black host `body` and render invisible. The video's base ground is painted by the assembler from `frame.md`'s `canvas` color onto the index `#root`. (Full rule + self-check: `frame-worker-core.md`.)

As each worker returns, mark that frame `animated` in `STORYBOARD.md`.

After audio timings exist, build captions in the background and assemble the index:

Call `frames.captions {"project": "/absolute/path/to/project", "mode": "pr-to-video", "command": "build", "storyboard": "STORYBOARD.md", "audio_meta": "audio_meta.json", "out": "caption_groups.json"}` to build absolute-time groups and seek-safe caption HTML using the project skin and `frame.md` tokens. Skip explicitly when disabled or no narration words exist.

Call `frames.assemble {"project": "/absolute/path/to/project", "mode": "pr-to-video", "storyboard": "STORYBOARD.md", "audio_meta": "audio_meta.json"}`. It validates nonempty matching-id frames and positive durations, mounts ordered frames on track 1, captions on 2, voices on 10, BGM on 11 and SFX on 20+, paints the root canvas, declares dimensions/duration and registers a paused main timeline. Supplied BGM covers the cut with fades, at volume 0.12 under narration or 0.9 without it. Voice/SFX remain index-owned. Absent audio metadata yields silent assembly; pending BGM blocks unless `allow_pending_bgm: true` deliberately requests a silent preview.

**Gate:** every frame is marked `animated` (collaborative: the sketch sheet was confirmed at Step 4), `index.html` exists, and captions are built or explicitly skipped.

---

## Step 6: Finalize

Goal: Verify the assembled video, get user approval, and render the final MP4.

Inject transitions, run checks, pause for review, then render.

Call `frames.transitions {"project": "/absolute/path/to/project", "mode": "pr-to-video", "command": "inject", "storyboard": "STORYBOARD.md"}`, then `frames.transitions {"project": "/absolute/path/to/project", "mode": "pr-to-video", "command": "verify", "storyboard": "STORYBOARD.md", "index": "index.html"}`. The injector uses registered transition recipes, pads only outgoing wrapper/internal durations and alternates overlap lanes without shifting starts or audio/caption/SFX timing. `cut`, `none` or empty stays a hard cut. Verification must pass before checks.

`frames.lint`

`frames.check`

`frames.snapshot {"project": "/absolute/path/to/project", "at": [0.5, 1.5, 3.0]}`

`snapshot` stitches the captured frames into one contact sheet (`snapshots/contact-sheet.jpg`). Glance at it; if nothing is obviously broken, move on - don't linger here.

If a command fails, surface stderr and stop - don't pile on recovery commands. Fix it yourself: the cheapest safe edit to `compositions/frames/NN-*.html`, then rerun the failed check.

Caption highlight ink can extend slightly into a snug pill's padding when it is not clipped. Inspect reported caption overflow before changing line-height; fix actual clipping and any frame-element overflow.

After checks pass, pause for user review - the review loop's final look (`review-loop.md` § 4): one question, on the final live preview - render now, or what changes? (Autonomous: the one kept question, preview first or render - open the preview with the command below on a yes.) Then deliver the MP4 with the contact sheet and the frame ids so revisions can target a single frame.

Preview: `frames.preview {"project": "/absolute/path/to/project"}`

Render only after user approval (autonomous mode: after the preview-or-render question):

`frames.render {"project": "/absolute/path/to/project", "quality": "high", "output": "renders/video.mp4"}`

Do not rerun `lint`, `check`, or `snapshot` after rendering unless the user asks.

After the user is done reviewing (or after render when no more live edits are expected), stop only this project's background server: `frames.preview {"project": "/absolute/path/to/project", "stop": true}`. Never tear it down while waiting for review.

**Gate:** `lint` and `check` passed and the snapshots were inspected before render; user approved at the review pause (autonomous: checks passed and the delivery includes the contact sheet); `renders/video.mp4` exists. Final reply states the MP4 path and final duration.

---

## Quick Reference

**Formats:** landscape `1920x1080`; portrait `1080x1920`; square `1080x1080` - derived from the destination (brief contract § 2). Set the format once in the storyboard frontmatter.

**PR deltas vs a captured-asset workflow:** no Step 1 capture (the `gh` CLI ingests the PR into a synthetic `capture/extracted/` package - `tokens.json` + `visible-text.txt` + `people.json`); the only real assets are the contributors' `assets/<login>.png` avatars (the credits close); no `asset-descriptions.md`, no asset-staging step. Code beats are rendered by the `code-*` registry blocks on code-editorial's navy Code Surface; the style is always **code-editorial**.

**Workflow tools:** PR project resolution/preflight/fetch/ingest use `frames.fetch_pr`; public avatar downloads use `frames.fetch_avatars`. Preset adoption, narration, duration sync, SFX metadata, packets, captions, transitions and index assembly use the tools above with explicit `pr-to-video` mode. Registry blocks install via `frames.add`. Hosted media/authentication and all remote mutations remain excluded.

The reusable, domain-agnostic shot shapes live in `animation/blueprints` (indexed by `animation/blueprints-index.md`); the `code-*` registry blocks are the code-beat vocabulary (`pr-to-video/references/code-vocabulary.md`).

| Read                                                                                                                                                        | When                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `[brief-contract.md](brief-contract.md)`                                                                | Gate types, mode derivation from `BRIEF.md`, field semantics.                                            |
| `[creative/references/story-spine.md](creative/references/story-spine.md)`                                                    | Step 3: story doctrine - hook language, value-before-evidence, proposal shape, source-traceable visuals. |
| `[pr-to-video/references/story-design.md](pr-to-video/references/story-design.md)`                                                                                                  | Step 3: plan the PR explanation.                                                                         |
| `[animation/blueprints-index.md](animation/blueprints-index.md)`                                                              | Step 3: role→blueprint menu. Step 4: pick the shot shape.                                                |
| `[storyboard-format.md](storyboard-format.md)`                                                          | Step 3: write `STORYBOARD.md`.                                                                           |
| `[script-format.md](script-format.md)`                                                                  | Step 3: write `SCRIPT.md`.                                                                               |
| `[media-use/audio/references/tts.md](media-use/audio/references/tts.md)`                                                                              | Step 3.1: choose or understand TTS providers.                                                            |
| `[pr-to-video/references/visual-design.md](pr-to-video/references/visual-design.md)`                                                                                                | Step 4: write the frame's shot sequence (+ Layout vocabulary).                                           |
| `[pr-to-video/references/code-vocabulary.md](pr-to-video/references/code-vocabulary.md)`                                                                                            | Step 4 + 5: pick + fill the `code-*` block for a code beat.                                              |
| `[pr-to-video/references/motion-language.md](pr-to-video/references/motion-language.md)`                                                                                            | Step 4: the motion vocabulary + the motion doctrine.                                                     |
| `[pr-to-video/references/cut-catalog.md](pr-to-video/references/cut-catalog.md)`                                                                                                    | Step 4-5: the cut catalog (worker builds within-frame seams).                                            |
| `[animation/rules-index.md](animation/rules-index.md)` + `[animation/rules](animation/rules)` | Step 5: local rule recipe bodies for the cited motions.                                                  |
| `[frame-worker-core.md](frame-worker-core.md)`                                                          | Step 5: the shared worker contract (packet builder prepends it to the delta).                            |
| `[pr-to-video/sub-agents/frame-worker.md](pr-to-video/sub-agents/frame-worker.md)`                                                                                                  | Step 5: the workflow's frame-worker delta.                                                               |
| `[subagent-dispatch.md](subagent-dispatch.md)`                                                          | Step 5: dispatch pr-to-video/sub-agents safely.                                                                      |
| `[creative/frame-presets/code-editorial/FRAME.md](creative/frame-presets/code-editorial/FRAME.md)`                            | Step 2: the code-editorial preset (fixed style).                                                         |
