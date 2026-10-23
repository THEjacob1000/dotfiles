---
name: frames
description: Create, edit, animate, inspect, validate, preview, or render HyperFrames HTML videos, interactive decks, and browser lessons with Numen's frames tools. Teach codebase architecture through source-grounded lessons or explore an authored system model. Covers custom videos, promos, PR and topic videos, music-driven edits, captions, overlays, motion graphics, Remotion ports, composition structure, animation, creative direction, media, audio and registry components. Read this entry first, then only the references needed. Figma import, Studio, hosted publishing and remote asset services are unavailable.
generated-by: numen-sync
---

<!-- Adapted from HyperFrames (https://github.com/heygen-com/hyperframes/tree/e1925d4317fcd13c0e5799cd4767a3e2dd4c9238/skills). Copyright 2026 HeyGen, Inc. Licensed under Apache-2.0; see frames/LICENSE. Modified for Numen: consolidated references and local frames.* MCP tool workflows. -->

# Frames

Frames provides local HTML video compositions, interactive decks and source-grounded browser lessons through `frames.*` tools. Choose the requested experience before authoring: teach with a lesson, inspect its authored model in explore mode, or produce a video composition. Lesson v2 video export is not available.

## Architecture teaching and exploration

For “teach me this codebase,” a mechanism walkthrough or architecture exploration, read [architecture learning](references/architecture-learning.md) first, then [lesson operations](references/lesson.md). Define objectives, inspect one bounded slice, assemble evidence, outline, storyboard, preflight and save, then teach and adapt. Guided and explore modes share an authored lesson; exploration is not automatic repository discovery or code execution. Load [scene rules](references/lesson-scenes.md) for causal animation and [evidence rules](references/lesson-evidence.md) for grounding and uncertainty.

An explicit video request follows the video workflows below, even when its subject is code. An interactive explanation follows the lesson workflow, not the composition init/lint/render pipeline.

## Core workflow: init → lint → render

1. **Start from state.** For an existing project, read its `BRIEF.md` and `STORYBOARD.md` when relevant. Perform the requested edit or operation without restarting intake. Use `frames.timeline` to inspect what plays, where, and when. For a fresh creation request, read [the intent interview](references/intent-interview.md), choose the deliverable workflow below, and read its intake contract in `references/routes/`. An explicit Remotion port goes directly to its guide; lessons and architecture teaching use the routes above. A question or hold does not authorize an edit.
2. **Init and author.** Read [the composition contract](references/core.md) before writing HTML. Use `frames.init` to initialize a new project, then write the confirmed `BRIEF.md`; initialization requires an empty destination. Follow the selected workflow and load domain references only as needed. Before scripting about code, read the exact repository files and symbols. Show code verbatim from those files and narrate only behaviour the source shows. Fetch a needed revision into a separate workspace without modifying the caller's tree.
3. **Lint and inspect.** Use `frames.lint` for fast feedback while authoring; gate with `frames.check` (it runs lint) and fix reported defects. Inspect `frames.snapshot` output at representative times and use `frames.preview` for the live player. Follow the [review loop](references/review-loop.md) for storyboard and final-look approvals. A plan or sketch approval is not final-video approval.
4. **Render.** After the final approval required by the review contract, call `frames.render` and deliver the local output. For an interactive deck, use `frames.present`; for an interactive lesson, use `frames.lesson`. Do not assume an MP4 is the deliverable. Tool arguments and diagnostics live in [the CLI guide](references/cli.md).

## Deliverable workflows

Choose by the requested output, not an incidental input format. A caption or overlay workflow preserves the underlying footage; retiming or remixing it is a custom edit. A music bed does not select the music-driven workflow. Use the general-video workflow when no specialized route fits, including `flow: companion` briefs.

| Task | Guide |
| --- | --- |
| Custom video, longer sequence, montage, footage edit, or companion build | [references/general-video.md](references/general-video.md) |
| Product launch, website showcase, app demo, or promo | [references/product-launch-video.md](references/product-launch-video.md) |
| Video explaining a GitHub PR or code change | [references/pr-to-video.md](references/pr-to-video.md) |
| Video explaining a topic, article, or notes using invented visuals | [references/faceless-explainer.md](references/faceless-explainer.md) |
| Beat-synced or lyric video driven by a supplied music track | [references/music-to-video.md](references/music-to-video.md) |
| Short unnarrated motion-first graphic, title, logo sting, or overlay | [references/motion-graphics.md](references/motion-graphics.md) |
| Captions or subtitles on unchanged talking-head footage | [references/embedded-captions.md](references/embedded-captions.md) |
| Designed graphic overlays on unchanged interview or podcast footage | [references/talking-head-recut.md](references/talking-head-recut.md) |
| Presentation, pitch deck, or interactive slideshow | [references/slideshow.md](references/slideshow.md) |
| Codebase architecture teaching, mechanism walkthrough, or authored-model exploration | [references/architecture-learning.md](references/architecture-learning.md) |
| Interactive lesson or concept explanation the learner can inspect and question | [references/lesson.md](references/lesson.md) |
| Explicitly port existing Remotion source to HyperFrames | [references/remotion-to-hyperframes.md](references/remotion-to-hyperframes.md) |

## Domain guides

| Task | Guide |
| --- | --- |
| HTML structure, timing, tracks, variables, sub-compositions, determinism | [references/core.md](references/core.md) |
| Motion rules, scene blueprints, transitions, animation runtimes | [references/animation.md](references/animation.md) |
| Seek-safe zooms, reframing, paths, masks, SVG, 2D/3D keyframes | [references/keyframes.md](references/keyframes.md) |
| Design specs, palettes, typography, narration, beat planning | [references/creative.md](references/creative.md) |
| Supplied assets, captions, local voiceover, grading, media treatments | [references/media-use.md](references/media-use.md) |
| Placed-track gain, fades, automation, ducking, effects, submix buses | [references/audio.md](references/audio.md) |
| Init, inspection, history, lint, checks, snapshots, preview, render | [references/cli.md](references/cli.md) |
| Discover and install pinned upstream registry blocks, components, named effects | [references/registry.md](references/registry.md) |

Search the pinned upstream registry with `frames.catalog` before hand-building a named effect or transition; install matching items with `frames.add`. For combined picture and sound edits, load core plus keyframes for camera motion and audio for mixing. Domain guides support the chosen deliverable; they do not replace its workflow.

## Shared process

- [Brief format](references/brief-format.md) and [interaction contract](references/brief-contract.md)
- [Workflow intake catalog](references/workflow-catalog.md)
- [Capability menu](references/capability-menu.md)
- [Storyboard and review loop](references/review-loop.md)
- [Production loop](references/production-loop.md)
- [Frame-worker contract](references/frame-worker-core.md) and [dispatch](references/subagent-dispatch.md)
- [Script format](references/script-format.md)

Supporting resources stay beside each guide in `references/<workflow>/`. Shared process references remain directly in `references/`. Use exported local assets for designs from external tools; Numen has no Figma import or Studio workflow. License and attribution are in this skill's `LICENSE` and `NOTICE.md`.
