<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/hyperframes-core/SKILL.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->


# HyperFrames Core

**Agent pitfalls (read first):**

- Center with flex/`inset`, not CSS `transform: translate(-50%,-50%)` on a node you then GSAP `x`/`y`. Lint: `gsap_css_transform_conflict`. Use `fromTo` or `xPercent`/`yPercent`.
- Do not add a scene-exit `tl.set(..., {visibility:"hidden"})`. The runtime already hides timed clips. Opacity fades on inner nodes (or `opacity` on `.clip`) are enough. Caption hard-kills are a different rule.
- `window.__timelines["id"]` must match the root `data-composition-id`.
- After `render`, read the summary's second line: `beginframe` vs `screenshot`, GPU mode, stage timings. `screenshot` + `software gpu` on Linux is the slow path.

HyperFrames renders video from HTML. A composition is an HTML file whose DOM declares timing with `data-*` attributes, whose animation runtime is seekable, and whose media playback is owned by the framework.

This skill is the **technical contract** - how to build one HyperFrames project. The body below is the build guide; per-topic detail lives in `core/references/` (index next), read on demand. Process docs (brief, storyboard, review, production, dispatch, frame-worker) live in `/frames` → `references/`. Other concerns live in the domain reference guides - `frames references/animation.md`, `frames references/creative.md`, `frames references/media-use.md`, `frames references/cli.md`, `frames references/registry.md`. The capability map in `/frames` says what each one covers.

## References

| File                                    | Read it to…                                                                                                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core/references/minimal-composition.md`     | start from the smallest renderable composition skeleton                                                                                                             |
| `core/references/composition-patterns.md`    | choose monolithic vs modular; structure a modular `index.html`; pick a sub-comp archetype                                                                           |
| `core/references/data-attributes.md`         | look up any `data-*` (root / clip / sub-comp host / legacy aliases); use `class="clip"`                                                                             |
| `core/references/tracks-and-clips.md`        | understand what `data-track-index` does (and does not) control, z-index, time a clip relative to another; list every track and clip with `frames.timeline` |
| `core/references/creator-editing-recipes.md` | copy truthful cut/trim/reorder/retime/freeze/camera/mask/crossfade/audio editing recipes and their limits                                                           |
| `core/references/sub-compositions.md`        | wire a sub-composition (host attrs, `<template>`, per-instance vars) and animate inside it                                                                          |
| `core/references/variables-and-media.md`     | declare variables; place `<video>`/`<audio>`, set volume, trim                                                                                                      |
| `core/references/determinism-rules.md`       | build a seekable timeline; determinism bans; layout / text fit                                                                                                      |
| `core/references/full-screen-motion.md`      | author full-frame motion with shared backgrounds                                                                                                                    |
| `core/references/tailwind.md`                | work in a Tailwind v4 project with a pinned runtime or compiled CSS |

For animation runtime specifics (GSAP API, Lottie, Three.js, etc.) go to `frames references/animation.md` → `adapters/<runtime>.md`.

## Building a composition

### Two root forms (not interchangeable)

- **Standalone** (top-level `index.html`): root `<div data-composition-id="…">` sits directly in `<body>`, **no `<template>` wrapper**. Wrapping a standalone root hides all content and `lint` rejects it (`standalone_composition_wrapped_in_template`, error).
- **Sub-composition** (loaded via `data-composition-src`): wrap the root in `<template>`. This is the shape to write: the loader also accepts a plain full document and falls back to its `<body>`, but the templated form is what the examples and tooling assume.

> Warning: for a **templated** sub-composition the assembler drops the file's own `<head>` `<style>`/`<script>`, so put `<style>`/`<script>` **inside** the template. `<link>` is hoisted either way.
> Warning: host-id convention: give the host slot, the inner template, and the `window.__timelines["<id>"]` key the **same** id. A different local id is supported (the assembler falls back to the first root in the file) but the mismatch is silent, so match them unless you have a reason not to.

File shape, host wiring, and the pre-render checklist → `core/references/sub-compositions.md`.

### Root must be sized (silent layout bug)

The standalone root authors `width`/`height: 100%`. Canvas size is `data-width`/`data-height`. The runtime stamps those pixels onto the composition root. Do not hardcode `1920px`/`1080px` on `#root`. Skeleton → `core/references/minimal-composition.md`.

### One paused timeline

Each composition registers **exactly one** `gsap.timeline({ paused: true })` at `window.__timelines["<id>"]` (key = root `data-composition-id`). Building it inside an async callback (`document.fonts.ready`) is supported; what matters is that you **register only after the build completes**. Render length is the root's `data-duration`, **not** the timeline's length: a timeline that runs past it is cut off, and one that ends early holds its last frame. Omit the root `data-duration` and the length is inferred instead (timeline, media window, or adapter). You do not need `window.__timelines = window.__timelines || {}`: the runtime creates the registry before your inline scripts run, and `lint` no longer asks for it. Don't manually nest sub-timelines into the host; the runtime auto-nests registered child timelines. Full contract (incl. non-GSAP runtimes) → `core/references/determinism-rules.md` + `frames/references/animation/adapters/`.

### First-pass lint gotchas (a guaranteed first build failure)

Rules that `lint` **does** catch, but only after the fact. Write them right the first time:

- Never pair a CSS initial `transform` with a GSAP tween on the **same** property - the CSS value and the tween's start fight and `lint` rejects it with `gsap_css_transform_conflict`. Set the initial state inside the tween with `gsap.fromTo(el, { x: -40 }, { x: 0 })` instead of a CSS `transform: translateX(-40px)`.
- Never put `crossorigin` on `<video>`/`<audio>`. `lint` rejects it unconditionally with `media_crossorigin_breaks_preview` (error), including for canvas/WebGL/WebAudio readback. There is no suppression.
- Never give a `<video data-start>` an ancestor that also carries `data-start`. `lint` rejects it with `video_nested_in_timed_element` (error). Time the wrapper **or** the video, not both.
- Every `<audio>` needs an `id`. `lint` rejects it with `media_missing_id`, and an id-less `<audio>` is never picked up by the mixer, so the render is **silent**.
- Never tween a `.clip` with `autoAlpha` or `visibility` - `lint` rejects it with `gsap_animates_clip_element`. Animate a child instead.
- A named CSS `font-family` needs an in-file `@font-face` to a shipped local file, or `lint` fires `font_family_without_font_face`.
- Sub-composition `#root` uses `width`/`height: 100%` (or `inset: 0`), not hardcoded `1920px`/`1080px`. Canvas size is `data-width`/`data-height`.

A lint **error** also switches off the layout and contrast audits: `check` then reports `0 sample(s)` and `0/0 text checks`, which reads like a clean file but means nothing ran. Clear lint errors before you trust those numbers.

### Non-negotiable rules (silent bugs automated gates may miss)

Surfaced here; full rationale in the linked reference. Do not violate:

- No render-time clocks / unseeded `Math.random` / network / input-state; `repeat: -1` only under a finite root `data-duration` (export clips to it - otherwise use a finite count). → `determinism-rules.md`
- Never tween `display`, `visibility`, or `autoAlpha` on a `.clip` element. The framework owns clip visibility, and `lint` rejects it (`gsap_animates_clip_element`). Animate a child instead. → `determinism-rules.md`
- No `<br>` in body text; transformed elements must be block-level + sized; pulsing absolute decoratives need peak clearance. → `determinism-rules.md`
- `<video>`/`<audio>` are found by a flat document query, so the framework seeks and decodes them at **any nesting depth** (including inside a sub-comp `<template>` or wrapper). One hard limit: `lint` errors if a `<video data-start>` sits inside another **plain** element that also has `data-start`, and the failure is real (wrong source frames, then the clip vanishes mid-slot), so put the timing on the wrapper or on the video, never both. Sub-composition hosts are exempt: media inside a sub-composition renders correctly. The other caveat is timelines, not placement: a sub-comp timeline can't animate host-root elements. → `variables-and-media.md`
- Keep every `id` unique across the **assembled** page (prefix sub-comp ids with the composition id, `#<id>-hero`) so your own `#id` CSS and `getElementById` calls resolve. Frame injection no longer depends on it: the compiler stamps a document-unique `data-hf-render-id` on every `video[src]`/`audio[src]`/`img[src]`. Media that uses `<source>` children instead of a `src` attribute is **not** stamped, so unique ids still matter there. → `composition-patterns.md`
- A full-screen fill on the composition **root** is fine on a normal render. It is dropped only on the layered-composite path (HDR content, or a composition using shader transitions), where the engine forces every composition root transparent so the layer beneath shows through. If your composition uses shader transitions or HDR media, put the fill on a full-bleed **child** (`position:absolute; inset:0`). → `composition-patterns.md`

## Editing existing compositions

Studio editing is unavailable in Numen. `frames.preview` and `frames.play` are live players, not editors; inspect with `frames.timeline` and make changes in the composition source.

- Read the files first. Preserve unrelated timing, tracks, IDs, variables, media paths.
- To know what is on a project's timeline (tracks, clips, starts, ends, what plays), run `frames.timeline` instead of reading `index.html` and every sub-composition file.
- Match existing composition IDs and timeline keys.
- Adding a clip: set its `data-start`/`data-duration` intentionally against the clips around it. `data-track-index` groups clips for timeline inspection, not timing, so it does not need to be free.
- A clip that ends past the root `data-duration` is cut off: extend the root `data-duration` to the clip's end in the same edit (`lint` warns `clip_ends_past_root_duration`).
- `data-hidden` on any composition element hides it in BOTH preview and render, overriding its time window; set or remove it in source for reversible hiding.
- Adding a sub-composition: verify its internal `data-composition-id` before wiring the host.

## Validation

Use `frames references/cli.md` for command details

- [ ] `frames.check` passes (0 findings across lint, runtime, layout, motion, and contrast)
- [ ] Projects with sub-compositions: `frames.snapshot {"project": "/absolute/path/to/project", "at": [0.5, 1.5, 3.0]}` and eyeball each frame
- [ ] `frames.preview` or `frames.play` for live playback review; any edits happen in source
- [ ] `frames.render` only after the user approves
