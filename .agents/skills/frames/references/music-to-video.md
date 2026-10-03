<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/music-to-video/SKILL.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->


The frames skill and its references ship with Numen and are projected by `numen sync`; read the ported skill files directly.

# frames references/music-to-video.md - one music-grounded, beat-synced video workflow

Use this skill to turn a **music track** into a beat-synced HyperFrames video. You analyze the track once, lay out the frames, fill in a per-frame plan, and build each frame as a composition. The input is a music track plus optional user images or videos - there is **no narration and no website capture**. Typography and templates are the floor (a complete video needs zero assets); any media the user supplies is cut in on the same beat grid.

You are the **orchestrator**. Work in `videos/<project>/`. Run the steps in order and pass each **Gate** before moving on. Two steps need the user: **Step 3** (plan approval) and **Step 6** (render approval) - both are checkpoint gates per `brief-contract.md` (read it before Step 0): in autonomous mode, post the summary as a heads-up and proceed instead of waiting. Do every step yourself except **Step 4**, where you dispatch **one sub-agent per frame**. Keep design and motion rules out of this file - they live in `music-to-video/references/` and the `frame-worker` sub-agent.

`SKILL_DIR` = this skill directory. `PROJECT_DIR` = `videos/<project-name>/`.

Workflow: Step 0 setup → `hyperframes.json` + `assets/bgm.mp3`; Step 1 analyze → `audiomap.json`; Step 2 skeleton → `STORYBOARD.md` (frames, groups `TBD`); Step 3 plan → complete `STORYBOARD.md` + `frame.md`; Step 4 build → `compositions/frames/NN-*.html`; Step 5 assemble → `index.html`; Step 6 render → `renders/video.mp4`.

## Two ideas that shape everything

- **Use measured anchors, not invented annotations.** `frames.beats` is the beat analyzer. Its grid is useful for rhythmic tracks; for calm tracks, make listening-based phrasing decisions and record the chosen cut times explicitly rather than claiming the tool detected phrases or energy changes. Never fabricate unavailable energy, density, rolls, onsets, silence or hard-stop analysis fields.
- **One frame = one file; groups live inside.** Step 2 cuts the track into **frames**, and each frame becomes one composition file `compositions/frames/NN-<frame_id>.html`, built by one frame-worker. A frame can subdivide into **groups** (each a template or a motion-primitives combo). Extra density goes _inside_ a group, so **frame count tracks distinct treatments, not beats** - a fast track does not blow up the number of sub-agents.

---

## Step 0: Setup, BGM, and inputs

Goal: Establish the music source, create the HyperFrames project, and note any user-supplied media.

**The brief starts at the intent layer.** Opening rule, in order: **(1)** `BRIEF.md` exists → read it and ask nothing it answers - its `flow`/`storyboard` derive the mode (brief contract § 1). **(2)** No `BRIEF.md` but the project exists → resume from what's on disk; never re-interrogate. **(3)** A fresh creation request that arrived here directly → read `/frames` and run its intent layer (`intent-interview.md`): it confirms this route's must-haves (the music source, destination → aspect - `routes/music-to-video.md`) and announces what stays deferred - brand and genre are chosen at Step 3 by design. Write `BRIEF.md` immediately after init (never before - `init` refuses a non-empty directory) and record the preference-backed answers (`brief-format.md`). Edit requests skip all of this.

The **music is the spine** - establish one track before anything else. This skill is tuned for **fast, high-energy BGM**: a strong beat grid drives cuts (calm tracks work, but pace by phrase rather than beat). Use user-supplied audio or extract real audio from a supplied video. Hosted music generation/catalog lookup and authentication are unavailable in Numen; a mood-only request needs a user-supplied track before this workflow can proceed. The track lands at `assets/bgm.mp3`; stage supplied images/videos or let typography carry the video.

**Lyric videos:** get word/line timing with `frames.transcribe {"input": "$PROJECT_DIR/assets/bgm.mp3"}`, or use supplied lyrics aligned to measured anchors.

Initialize only if `hyperframes.json` is missing. Name `<project>` from the brief in kebab-case, such as `midnight-drive-loop` - never a timestamp.

`frames.init {"project": "/absolute/path/to/project"}`

Create `assets/` and `renders/`, then copy the supplied track to `assets/bgm.mp3` (extract or transcode first when needed; never merely rename another codec). If images/videos were supplied, call `frames.stage_assets {"project": "/absolute/path/to/project", "mode": "music-to-video", "from": "<supplied-directory>", "into": "public"}` to stage common local media into `assets/public/`, preserving basenames and existing destinations (first wins). Note the resulting inventory; this does not retrieve hosted assets.

The **brand** (font + palette) is chosen at Step 3, not here. Don't pick a genre or a track type up front - assets are just an optional ingredient, and the genre emerges from the per-frame choices.

**Gate:** `hyperframes.json` + `assets/bgm.mp3` exist; aspect / length / fps and (if any) the asset inventory are noted.

---

## Step 1: Analyze the music

Goal: Produce the one canonical timing analysis the whole video is built on.

Mount the supplied track in `index.html` as `<audio data-timeline-role="music" src="assets/bgm.mp3">`, then call `frames.beats {"project": "/absolute/path/to/project"}`. Read the beat file named by its returned `file`: it contains `audio`, `beats` (time and strength), `bpm` and `downbeats`; the result itself is only a summary. Measure duration with ffprobe and author `audiomap.json` with `audio.duration_sec` and those measured anchors for this workflow. Do not invent absent phases, rolls, silences or phrases. Tempo/grid is useful only for genuinely rhythmic music; make that pacing judgment at Step 2.

**Gate:** `audiomap.json` exists; `audio.duration_sec` is known.

---

## Step 2: Frame skeleton (structure only)

Goal: Read the music and lay out the frames - the skeleton of `STORYBOARD.md`.

Read [`music-to-video/references/frame-skeleton.md`](music-to-video/references/frame-skeleton.md). Turn `audiomap.json` into the skeleton of `STORYBOARD.md`. For rhythmic tracks, snap boundaries to measured beats or downbeats. For calm tracks, record deliberate phrase-flow cuts chosen from listening without inventing analysis fields. Each frame needs `span_sec`, `pacing` (`beat_cut` or `phrase_flow`), `mood` and a one-line `feel`. Leave `### Groups` as `TBD (Step 3)` and frontmatter `style` blank until the treatment pass.
Parse the skeleton with `frames.storyboard {"project": "/absolute/path/to/project", "mode": "music-to-video", "storyboard": "STORYBOARD.md"}` to inspect frame fields and parser warnings. This reads the authored file, not a second planning format; measured musical anchors still own the cuts.


**Gate:** frames tile the track (first at 0, last at `duration_s`); each carries `span_sec` + `pacing` + `mood` + `feel`; every `### Groups` is `TBD`; no content anywhere.

---

## Step 3: Fill the plan (user-gated)

Goal: Turn the skeleton into an approved, complete `STORYBOARD.md`.

Read [`music-to-video/references/planning.md`](music-to-video/references/planning.md), [`storyboard-format.md`](music-to-video/references/storyboard-format.md), [`template-catalog.md`](music-to-video/references/template-catalog.md), [`motion-primitive-catalog.md`](music-to-video/references/motion-primitive-catalog.md), and [`montage.md`](music-to-video/references/montage.md) (only if the user supplied assets). Editing the same file in place, do two things:

1. **Pick the brand.** Choose one preset from `creative/frame-presets` using `creative/references/design-spec.md` (match the track's mood; **only its fonts and colors matter** - templates own composition). Adopt it with `frames.build_frame {"project": "/absolute/path/to/project", "mode": "music-to-video", "preset": "<preset>"}` without brand-token remix, and fill frontmatter `style` (font + a ≤4–6 swatch palette) from the unchanged preset.
2. **Fill every frame.** Decide its groups and give each a treatment: a matched template from the catalog (with bound params and real audiomap anchors), a free-compose from the primitive catalog, or an asset treatment that **obeys `pacing`**. **Before you free-compose a named look, search the live catalog for it**: for every look, effect, treatment or transition the user asked for - "CRT scanlines", "glitch", "film grain", "shimmer sweep" - run `frames.catalog {"query": "<the look, in plain English>"}` and read the top results. `template-catalog.md` and `motion-primitive-catalog.md` list only this skill's own local materials; the search uses Numen's local catalog registry and needs **nothing installed** - no project, no prior `add`, no account. Free-compose a look only after a search for it came back with nothing that fits. Write the copy. You own WHAT (template / primitives + content + anchors); the frame-worker owns HOW - **never write millisecond tweens into the storyboard**.

Call `frames.validate_plan {"project": "/absolute/path/to/project", "mode": "music-to-video", "storyboard": "STORYBOARD.md", "audiomap": "audiomap.json", "templates": "/absolute/path/to/frames/references/music-to-video/references/templates"}` before building. Use the installed skill's actual absolute templates directory. It checks measured duration within 0.05s, nonempty frames, `src`, positive duration, filled groups, track tiling within 0.1s and mutually exclusive treatments. Missing template IDs and beat-cut treatments on phrase-flow frames are warnings; resolve missing templates before building. `frames.check` and `frames.lint` validate compositions later, not this plan.

Fix every hard error (duration mismatch, frames not tiling the track, missing `src`, empty groups); resolve template-not-found warnings; other warnings need judgment. Then present the frame-by-frame summary as a proposal (`review-loop.md` § 1) and iterate until approved; for `storyboard: yes`, also write `storyboard.html` (`creative/references/storyboard-recipe.md` § 3). In autonomous mode post the summary as a heads-up and proceed; the plan quality gate still blocks.

**Gate:** `frame.md` is a verbatim preset copy; the plan checks pass; the user approved (autonomous: summary posted as a heads-up).

---

## Step 4: Build frames from the plan

Goal: Build every frame as a self-contained composition file.

Create `compositions/frames/`. Read [`music-to-video/sub-agents/frame-worker.md`](music-to-video/sub-agents/frame-worker.md) and `subagent-dispatch.md`. Dispatch **one frame-worker per frame**, in parallel where possible (otherwise in waves). Each worker gets exactly one frame and this context:

```text
PROJECT_DIR: <abs path>
frame_id: <NN-frame_id>              # = the frame file stem, e.g. 02-f2; the composition id
Your block: the `## Frame N - <frame_id>` block in PROJECT_DIR/STORYBOARD.md
audiomap: PROJECT_DIR/audiomap.json
frame.md: PROJECT_DIR/frame.md
Materials: for each group, <SKILL_DIR>/references/music-to-video/references/templates/<id>/index.html (templates) and
           <SKILL_DIR>/references/music-to-video/references/motion-primitives/<id>/ (free); staged assets/ (asset groups)
Contracts: core/references/sub-compositions.md + determinism-rules.md
Canvas: <w>×<h>   Pacing: <beat_cut|phrase_flow>
Write to: PROJECT_DIR/compositions/frames/<frame_id>.html
```

The worker forks the cited materials, converts every anchor to frame-local seconds (`local_t = track_t − span_sec[0]`), gates its groups with 0ms cuts, and writes one seek-safe frame file. **The worker never calls project gates such as `frames.lint`, `frames.check`, `frames.snapshot` or `frames.render`** - those commands operate on the assembled project, which doesn't exist yet, so they'd report on the wrong files. The worker just writes to the contract and stops; you verify after assembly (Step 6). As each worker returns, you can confirm its file landed on disk.

**Gate:** every frame has its `compositions/frames/NN-*.html` on disk.

---

## Step 5: Assemble

Goal: Wire the built frames + BGM into the playable `index.html`.

Call `frames.assemble {"project": "/absolute/path/to/project", "mode": "music-to-video", "storyboard": "STORYBOARD.md", "audiomap": "audiomap.json", "audio_meta": "audio_meta.json", "bgm": "assets/bgm.mp3", "out": "index.html"}`. It requires nonempty matching-id frame sources and positive durations, declares the measured track duration and storyboard canvas, mounts sequential wrappers on track 1 with hard cuts, and mounts the full-duration BGM on track 11 at volume 0.9. It writes a standalone root and paused GSAP main timeline. Do not use the transition injector or replace measured timing with estimates.

Fix missing/blank frames by re-dispatching only that frame's worker and reassembling; do not mount partial files.

**Gate:** `index.html` exists; total duration == `audiomap.audio.duration_sec`.

---

## Step 6: Verify and render

Goal: Verify the assembled video, get user approval, and render the final MP4.

Run tools on the **assembled project**, not individual frame files:

`frames.check {"project": "/absolute/path/to/project"}`

`frames.snapshot {"project": "/absolute/path/to/project", "at": [0.5, 1.5, 3.0]}`

Inspect at `t=0`, each frame start, the selected measured beats/downbeats and authored phrase-flow cuts, and the final frame. On failure, make the **cheapest safe fix** yourself: edit the offending `compositions/frames/NN-*.html`. Never change duration or audio timing to hide a sync issue. Once the gates pass, pause for user review, then render only on approval (autonomous mode: ask the one kept question - "preview first, or render?" - then deliver the MP4 with the contact sheet):

`frames.render {"project": "/absolute/path/to/project", "quality": "delivery", "output": "renders/video.mp4", "fps": 30}`

**Gate:** `check` passed and the snapshots were inspected; the user approved (autonomous: checks passed and the delivery includes the contact sheet); `renders/video.mp4` exists with audio, duration == `audiomap.audio.duration_sec`. The final reply states the MP4 path and duration.

---

## Resume table

| You have                   | Continue from |
| -------------------------- | ------------- |
| `assets/bgm.mp3` only      | Step 1        |
| `audiomap.json`            | Step 2        |
| `STORYBOARD.md` (skeleton) | Step 3        |
| `STORYBOARD.md` (complete) | Step 4        |
| all frame files            | Step 5        |
| `index.html`               | Step 6        |

## Quick Reference

**Formats:** landscape `1920x1080` by default; portrait `1080x1920`; square `1080x1080`. Set the canvas once in the storyboard frontmatter (`canvas: { w, h, fps }`).

**Workflow tools:** `frames.beats` supplies timing analysis; `frames.storyboard`, `frames.stage_assets`, `frames.build_frame`, `frames.validate_plan` and `frames.assemble` support planning and assembly. Pass explicit `music-to-video` mode and the project root. CLI flags map to snake_case fields; assets stay user-supplied and local, with no hosted catalog/authentication or remote mutations.

| Read                                                                                                           | When                                                    |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| [`music-to-video/references/frame-skeleton.md`](music-to-video/references/frame-skeleton.md)                                                 | Step 2: read the music, lay out the frames, set pacing  |
| [`music-to-video/references/planning.md`](music-to-video/references/planning.md) · [`storyboard-format.md`](music-to-video/references/storyboard-format.md) | Step 3: pick the brand, fill each frame, write the plan |
| [`music-to-video/references/template-catalog.md`](music-to-video/references/template-catalog.md)                                             | Step 3: pick a template per group                       |
| [`music-to-video/references/motion-primitive-catalog.md`](music-to-video/references/motion-primitive-catalog.md)                             | Step 3/4: L0 recipes for free-compose                   |
| [`music-to-video/references/montage.md`](music-to-video/references/montage.md)                                                               | Step 3/4: asset treatments (beat-cut / ken-burns)       |
| [`music-to-video/sub-agents/frame-worker.md`](music-to-video/sub-agents/frame-worker.md)                                                     | Step 4: dispatch + build one frame                      |
| `subagent-dispatch.md`                                                               | Step 4: dispatch music-to-video/sub-agents safely                      |
| `creative/references/design-spec.md`                                                            | Step 3: pick the preset (the brand)                     |

## Directory layout

```
frames/references/music-to-video/
  ../frames → music-to-video/references/music-to-video.md.md    entry
  music-to-video/references/   frame-skeleton.md · planning.md · storyboard-format.md
                template-catalog.md · motion-primitive-catalog.md · montage.md
                templates/<id>/          { index.html (+ assets/ · program.json) }  ← L1 catalog impls
                motion-primitives/<id>/  { index.html (mounts the scene), scene.html (the sub-composition) } (GSAP from CDN) ← L0 catalog impls
  music-to-video/sub-agents/   frame-worker.md   ← the one subagent (one per frame)
```
