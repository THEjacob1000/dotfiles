<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/general-video/SKILL.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->


# General video

Usage quotas and reset times are unavailable in Numen.

If a referenced skill is absent, state that limitation and continue only with available capabilities.

## 1. Apply cross-cutting source adapters

- **Media:** For media needs, load `/frames → references/media-use.md` and follow its Numen procedures for assets the user supplies and local audio tools. Do not promise unavailable search, SFX/BGM catalog, provider authentication, or Figma services.

These adapters do not change the workflow selected by `/frames`.

## 2. Start from project state

Apply the first matching row; do not evaluate lower state rows:

| State                                                      | Action                                                                                                         |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Specific edit                                              | Make the edit, preserve existing project decisions, then rerun affected checks. Do not reopen discovery.       |
| `BRIEF.md` exists                                          | Read it. If `workflow` names another workflow and `flow` is not `companion`, hand off. Ask no brief questions. |
| No brief, but `hyperframes.json` or `STORYBOARD.md` exists | Resume from files and recorded preferences. Backfill `BRIEF.md` only from known facts.                         |
| Fresh creation                                             | Run `/frames` and its intent layer. Return here only for `workflow: frames references/general-video.md` or `flow: companion`.  |

For a new project, choose a kebab-case directory name from the brief and scaffold with `frames.init {"project": "/absolute/path/to/project", "example": "blank", "skill": "frames references/general-video.md"}` before writing the brief.

Then write `BRIEF.md` at the project root using `brief-format.md`. In an existing project, the root is the directory containing `hyperframes.json`. Record only confirmed preference-backed fields directly in `BRIEF.md`; never record inferred defaults. If the intent layer adopted a recipe, apply it now using its `frame.md` as design source and do not ask again.

## 3. Interpret the run shape

Use only the canonical terms from `brief-contract.md`:

| Field          | Meaning                               | Effect                                                                              |
| -------------- | ------------------------------------- | ----------------------------------------------------------------------------------- |
| `flow`         | Who drives                            | `automation`: choose and execute the route. `companion`: co-create in conversation. |
| `storyboard`   | Plan, sketch, and review before build | `yes`: run plan and sketch review (`storyboard.html`). `no`: build without it.      |
| derived `mode` | How checkpoint gates behave           | Follow the brief contract. Never ask the user to name a mode.                       |

Do not invent synonyms for these states. An ongoing “just build it” signal is handled by the intent layer and arrives as `flow: automation`, `storyboard: no`.

- For `flow: automation`, choose the route and state it in one line in the first progress update.
- For a specific edit, make the edit without inventing a new route.

For a hard cut, trim, splice, or reorder of existing footage, duplicate the same
video source into multiple clip elements. On each copy, set the source range
with `data-media-start` plus `data-duration`, then set authored placement/order
with `data-start`. Each video segment keeps its sound: the sound stays on the clip (`data-has-audio="true"`), so cutting the video cuts its sound. `/frames → references/core.md` owns this temporal
edit; use `/frames → references/keyframes.md` only for visual-property animation such as
zoom, punch, pan, crop, mask, or `clip-path` on an inner wrapper.
Copy the full contracts from `core/references/creator-editing-recipes.md`.

### Companion flow

When `flow: companion`:

- Read `BRIEF.md` and reconcile accepted `## Assets` and `## Customizations` with project artifacts. Complete accepted work that is still pending; leave completed work alone; do not offer an accepted capability again as if it were new.
- **Arrive as the director, not the contractor.** A user who chose companion chose involvement and quality; the honest response is the best version you can design, not the smallest one you can defend. The first plan is the ceiling treatment: the story arc (borrow the nearest genre lens - menu § Genre lenses), the design spec, each scene's motion treatment cited by name (§ 5's plan discipline), the transitions, the audio identity - music and sound marks, or deliberate silence - the user's material placed, and a designed open and close. Say what each layer adds in one line; flag the expensive ones (render time, sign-in, billing) as you name them. The user trims a treatment down; they should never have to assemble one approval by approval.
- **The ceiling belongs to the concept, not the toolbox.** Every layer must serve the brief's message - a treatment that would dress any video the same way is decoration. Craft rises to the ceiling; content never grows past what was asked (§ 6).
- Between checkpoints, `capability-menu.md` works two ways. As the trigger list: offer a relevant capability when the user mentions its input or the build reaches its need. As each pass's upgrade channel: a plan, sketch, or build checkpoint may carry one or two traced offers pointed at material the user is looking at ("scene 3's stat wants the count-up treatment"). Read it before offering; never dump the full catalog.
- After the user accepts a capability, produce its artifact and record the decision in the matching `BRIEF.md` body section immediately. Rewrite a frontmatter field and record the confirmed preference only when the user explicitly changes it.
- Keep the same storyboard, validation, final-preview, and render-approval gates. Companion changes who steers, not what quality requires.

## 4. Load required knowledge before each stage

These reads are mandatory when their condition matches:

| Condition                                                                                                         | Read before acting                                                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Any composition HTML or scene layout                                                                              | `/frames → references/core.md`; use `references/determinism-rules.md` for its layout contract                                                                                                                                                     |
| Any non-trivial creation or visual treatment                                                                      | `/frames → references/creative.md` → `references/house-style.md` and `references/video-composition.md`                                                                                                                                            |
| Any motion, animation, or scene transition                                                                        | `/frames → references/animation.md`; follow its routing to the matching rules, adapters, blueprints, or transition references                                                                                                                     |
| `storyboard: yes`                                                                                                 | `storyboard-format.md` and `review-loop.md`                                                                                                                                        |
| Any media asset or operation, including narration, BGM, SFX, captions, grading, or transforms                     | `/frames → references/media-use.md`; for framework playback and placement also read `/frames → references/core.md` → `references/variables-and-media.md`                                                                                                                 |
| Multi-scene assembly                                                                                              | `production-loop.md`                                                                                                                                                                                         |
| `flow: companion`, before the first plan                                                                          | `/frames → references/creative.md` → `references/story-spine.md` and `references/house-style.md`; the nearest genre lens and the full `capability-menu.md` - the ceiling treatment is designed from these, not recalled |
| A companion capability offer, capture, beat grid, generative video, map, publishing, or cross-workflow capability | `capability-menu.md`                                                                                                                                                                                         |
| A design spec exists, before final approval                                                                       | `/frames → references/creative.md` → `references/design-adherence.md`                                                                                                                                                                             |

Do not replace these reads with recollection. Progressive disclosure saves context only when the matching reference is actually loaded.

## 5. Execute the composition

Use this dependency order. Skip a stage only when its input is absent.

Before writing any script or narration about code or a technical topic from a repository, ground it. For every symbol, file, or behaviour shown or narrated, write a lesson spec whose steps carry `code_refs` (`{"path": "<file relative to the workspace root>", "item_path": "<module, type or method path>"}`) and pass it to `frames.init` with the authored lesson object as `spec` and the absolute repository path as `workspace_root`. The lesson tool resolves each ref against the workspace and fails on any it cannot ground; write script narration and show code only from the grounded source it returns. Fix or drop a ref that fails rather than narrating from memory.

1. **Plan.** State the viewer arc, structure, rhythm, and duration driver. Use one file for a short single scene; use sub-compositions for three or more hard scene cuts or any reused scene. Read `/frames → references/creative.md` → `references/story-spine.md` for narrated arcs, `references/beat-direction.md` for rhythm, and `/frames → references/core.md` → `references/composition-patterns.md` for structure. For an open-ended multi-scene brief, expand the prompt through `/frames → references/creative.md` → `references/prompt-expansion.md`. A multi-scene plan cites each scene's shape: a blueprint id from `/frames → references/animation.md` → `blueprints-index.md` when one fits, or the named rules it composes from `rules-index.md` when none does - motion names come from those indexes, never invented. Story truth decides which scenes exist; the citation dresses them. **Search the live catalog before you plan to build any named look yourself**: for every look, effect, treatment or transition the brief names - "CRT scanlines", "glitch", "film grain", "shimmer sweep", "confetti burst" - run `frames.catalog {"query": "<the look, in plain English>"}` and read the top results before the plan names how that look gets built. The search needs **nothing installed**: no project, no prior `add`, no account. It ranks the local catalog registry (~400 blocks and components) from any directory, so it also applies to a look the user asks for mid-build. Blocks the plan names are installed at stage 3; hand-author a look only after a search for it came back with nothing that fits. A multi-scene plan is also recorded as the dispatch artifact: one `## Frame N` block per scene in `STORYBOARD.md` - `status: outline`, a declared `src:`, the blueprint/rules citation, and the beat text - **even when `storyboard: no`**. The block is the dispatch unit; the storyboard sheet is only the review surface.
   Parse multi-scene plans with `frames.storyboard {"project": "/absolute/path/to/project", "mode": "general-video", "storyboard": "STORYBOARD.md"}` and resolve malformed fields before dispatch. This reads the authored plan; it does not replace narrative or motion judgment.
2. **Review the plan when requested.** For `storyboard: yes`, run the shared review loop over those blocks. For `storyboard: no`, continue without a plan pause or sketch sheet. When a plan pause happens anyway, fold the sub-agent delegation grant (needed by codex for step 4's dispatch) into that pause rather than stopping again later.
3. **Resolve dependencies.** Install registry blocks before parallel work. Stage user assets and adopt existing media only as required by the brief. When using a shipped preset, call `frames.build_frame {"project": "/absolute/path/to/project", "mode": "general-video", "preset": "<preset>", "tokens": "capture/extracted/tokens.json"}`. Start audio early when its timings drive duration with `frames.narrate {"project": "/absolute/path/to/project", "mode": "general-video", "command": "generate", "script": "SCRIPT.md", "storyboard": "STORYBOARD.md", "out": "audio_meta.json", "voice": "numen"}`; it generates, normalizes and transcribes local narration and records measured metadata through the host's configured voice engine. Optional `bgm` and `sfx_library` refer only to supplied local audio and SFX manifests. Hosted catalogs, voice downloads and provider authentication remain excluded.
4. **Build scenes.** For a short single-scene piece, implement the scene at its most visible moment before adding motion (the confirmed wireframe, when present, is that end state and must not be redrawn), then animate from its cited blueprint or rules - read the full recipe body (`/frames → references/animation.md` → `blueprints/<id>.md`, `rules/<id>.md`) before writing motion.

   **Dispatch pays for itself only at scale.** Authoring packets and warming fresh worker contexts costs real minutes and tokens: a film of up to ~6 short scenes builds FASTER inline, in this context, one scene after another (measured: 5 short scenes ≈ 9 min inline vs ≈ 21 min packetized). Fan out only when the plan exceeds that - more scenes, or individually heavy ones - and then give each worker **2–3 scenes**, not one, and spawn **all workers in a single wave** (a second wave nearly doubles the window). When dispatching:

When dispatching, call `frames.frame_packets {"project": "/absolute/path/to/project", "mode": "general-video", "storyboard": "STORYBOARD.md", "out_dir": ".hyperframes/frame-packets"}`. It writes packets bounded to 48,000 bytes containing resolved project/design paths (first existing `frame.md`, `design.md`, `DESIGN.md`), rules-directory path, exact frame block, full selected blueprint and cited rules. `_role.md` combines shared worker core and this workflow's delta. Dispatch 2–3 scene packets per worker, all in one wave (`subagent-dispatch.md`), with `_role.md`, packet paths, `PROJECT_DIR`, scene IDs and canvas size.

5. **Merge motion sidecars.** Collect the workers' `compositions/<frame_id>.motion.json` files and carry their durations and exit/entry vectors into assembly; where the doctrine chain (`/motion-doctrine`) is installed, translate them into the project ledger before stamping seams.
6. **Assemble.** For storyboard-backed multi-scene projects, call `frames.narrate {"project": "/absolute/path/to/project", "mode": "general-video", "command": "sync-durations", "audio_meta": "audio_meta.json", "storyboard": "STORYBOARD.md"}` when voice metadata exists; measured voice durations override estimates. After local SFX cues are final, merge them with `frames.narrate {"project": "/absolute/path/to/project", "mode": "general-video", "command": "fetch-sfx", "audio_meta": "audio_meta.json", "storyboard": "STORYBOARD.md"}`. Build captions when words exist using `frames.captions {"project": "/absolute/path/to/project", "mode": "general-video", "command": "build", "storyboard": "STORYBOARD.md", "audio_meta": "audio_meta.json", "out": "caption_groups.json"}`. Call `frames.assemble {"project": "/absolute/path/to/project", "mode": "general-video", "storyboard": "STORYBOARD.md", "audio_meta": "audio_meta.json"}`, followed by `frames.transitions {"project": "/absolute/path/to/project", "mode": "general-video", "command": "inject", "storyboard": "STORYBOARD.md"}` and `frames.transitions {"project": "/absolute/path/to/project", "mode": "general-video", "command": "verify", "storyboard": "STORYBOARD.md", "index": "index.html"}`. Assembly mounts media/captions/audio on their index-owned tracks; injection preserves measured starts and media timing. For a single scene without a storyboard, retain the production loop's direct composition path. Review the mix; assembly's default BGM gain under voice is not a claim of automatic speech-ducking.
7. **Verify.** Use `frames.lint` for fast feedback after the first HTML pass and structural changes. For the final gate, run `frames.check`; it reruns lint internally, so do not run a redundant standalone lint immediately before it. For sub-compositions, inspect midpoint snapshots. For multi-scene work, review the animation map.
8. **Final approval.** Open the final live preview only after checks pass. Ask whether to render or revise. Render only after approval.

## 6. Gates that always apply

### Keep scope exact

Build what the user asked for. A title card is not a title card plus three scenes, music, and captions. Offer additions before adding them.

### Establish design before HTML

Resolve the design source in this order: `frame.md` → `design.md` → `DESIGN.md`. Treat the first file found as brand truth.

When no design spec exists, complete all four items before writing composition HTML:

1. Ground the visual identity in `house-style.md` and `video-composition.md`.
2. Write one sentence naming the concept angle for every non-trivial creation.
3. Choose an embeddable font pairing from `/frames → references/creative.md` → `references/typography.md`; do not assume an unbundled display font exists in local rendering.
4. Define the focal element, edge anchors, supporting detail, and background treatment.

Match density to the requested format and message. Density examples are guidance for produced frames, not permission to invent claims, scenes, or a fixed number of elements.

For a named style or mood, read `/frames → references/creative.md` → `references/visual-styles.md`. When the user needs to choose visually and no shipped preset fits, read `/frames → references/creative.md` → `references/design-picker.md` and run the interactive design selection there.

### Preserve the composition contract

Timed elements use `class="clip"`; the root and relevant ancestors are sized; each composition registers one paused, seek-safe timeline on `window.__timelines`; rendering is deterministic. Do not use render-time network fetches, clocks, or unseeded randomness.

### Borrow workflows safely

When the piece resembles a shipped workflow, borrow its genre references as examples. Read that workflow's frames reference guide directly. Borrow its story shape and taste, not its private scripts, pipeline state, or directory contract. The generic build remains owned by this skill.

## 7. Done

A run is complete only when:

- requested scope is implemented;
- for `flow: companion`, the treatment is delivered, not just the scope: every scene's cited blueprint or rules realized, the audio identity present (or the silence chosen and said), the open and close designed rather than defaulted;
- `frames.check` passes, including its built-in lint stage;
- design adherence is reviewed against `/frames → references/creative.md` → `references/design-adherence.md` when a design spec exists;
- contrast findings are resolved;
- sub-composition snapshots are inspected when applicable;
- an autonomous handoff includes an inspected contact or snapshot sheet; multi-scene sheets use scene midpoints;
- the handoff names the final preview or rendered artifact as applicable and reports the actual duration for a time-based deliverable;
- For multi-scene work, inspect the animation map by reading each scene's motion sidecar; no Numen tool generates the map.
- the user approves the final live preview before render;
- the rendered file is verified when a render was requested.

After final approval, offer once to freeze the run as a recipe, following `review-loop.md` § 4.
