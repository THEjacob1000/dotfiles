---
name: frames
description: Create, edit, animate, inspect, validate, preview, or render HyperFrames HTML video compositions, interactive decks, and interactive browser lessons with Numen's frames tools. Covers custom videos, product promos, PR and topic explainers, interactive concept lessons, music-driven videos, captions, talking-head overlays, motion graphics, Remotion ports, composition structure, animation, keyframes, creative direction, media, audio mixing, and local catalog components. Read this entry first, then load only the references needed for the task. Figma import, Studio, hosted publishing, and remote asset services are unavailable.
generated-by: numen-sync
---

# Frames

Frames renders video from HTML. A composition declares clip timing and tracks with `data-*` attributes, uses a deterministic seekable animation runtime, and leaves media playback to HyperFrames. Numen exposes the local workflow through `frames.*` tools. This single skill contains the authoring contracts, workflow guides, and supporting assets.

## Core workflow: init → lint → render

1. **Start from state.** For an existing project, read its `BRIEF.md` and `STORYBOARD.md` when relevant. Perform the requested edit or operation without restarting intake. Use `frames.timeline` to inspect what plays, where, and when. For a fresh creation request, read [the intent interview](references/intent-interview.md), choose the deliverable workflow below, and read its intake contract in `references/routes/`. An explicit Remotion port or interactive lesson goes directly to its guide. A question or hold does not authorize an edit.
2. **Init and author.** Read [the composition contract](references/core.md) before writing HTML. Use `frames.init` to initialize a new project, then write the confirmed `BRIEF.md`; initialization requires an empty destination. Follow the selected workflow and load domain references only as needed. For code explainer videos, supply grounded `code_refs` in the lesson `spec` and the absolute repository `workspace_root` to `frames.init`. Narrate only symbols and behavior resolved from that source.
3. **Lint and inspect.** Run `frames.lint`, then `frames.check`; fix reported defects. Inspect `frames.snapshot` output at representative times and use `frames.preview` for the live player. Follow the [review loop](references/review-loop.md) for storyboard and final-look approvals. A plan or sketch approval is not final-video approval.
4. **Render.** After the final approval required by the review contract, call `frames.render` and deliver the local output. For an interactive deck, use `frames.present`; for an interactive lesson, use `frames.lesson`. Do not assume an MP4 is the deliverable. Tool arguments and diagnostics live in [the CLI guide](references/cli.md).

## Deliverable workflows

Choose by the requested output, not an incidental input format. A caption or overlay workflow preserves the underlying footage; retiming or remixing it is a custom edit. A music bed does not select the music-driven workflow. Use the general-video workflow when no specialized route fits, including `flow: companion` briefs.

| Task | Guide |
| --- | --- |
| Custom video, longer sequence, montage, footage edit, or companion build | [references/general-video.md](references/general-video.md) |
| Product launch, website showcase, app demo, or promo | [references/product-launch-video.md](references/product-launch-video.md) |
| Explain a GitHub PR or code change | [references/pr-to-video.md](references/pr-to-video.md) |
| Explain a topic, article, or notes using invented visuals | [references/faceless-explainer.md](references/faceless-explainer.md) |
| Beat-synced or lyric video driven by a supplied music track | [references/music-to-video.md](references/music-to-video.md) |
| Short unnarrated motion-first graphic, title, logo sting, or overlay | [references/motion-graphics.md](references/motion-graphics.md) |
| Captions or subtitles on unchanged talking-head footage | [references/embedded-captions.md](references/embedded-captions.md) |
| Designed graphic overlays on unchanged interview or podcast footage | [references/talking-head-recut.md](references/talking-head-recut.md) |
| Presentation, pitch deck, or interactive slideshow | [references/slideshow.md](references/slideshow.md) |
| Interactive lesson or concept explainer the learner steps through and answers | [references/lesson.md](references/lesson.md) |
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
| Discover and install local catalog blocks, components, named effects | [references/registry.md](references/registry.md) |

Search the local catalog before hand-building a named effect or transition. For combined picture and sound edits, load core plus keyframes for camera motion and audio for mixing. Domain guides support the chosen deliverable; they do not replace its workflow.

## Shared process

- [Brief format](references/brief-format.md) and [interaction contract](references/brief-contract.md)
- [Workflow intake catalog](references/workflow-catalog.md)
- [Capability menu](references/capability-menu.md)
- [Storyboard and review loop](references/review-loop.md)
- [Production loop](references/production-loop.md)
- [Frame-worker contract](references/frame-worker-core.md) and [dispatch](references/subagent-dispatch.md)
- [Script format](references/script-format.md)

Supporting resources stay beside each guide in `references/<workflow>/`. Shared process references remain directly in `references/`. Use exported local assets for designs from external tools; Numen has no Figma import or Studio workflow. License and attribution are in this skill's `LICENSE` and `NOTICE.md`.
