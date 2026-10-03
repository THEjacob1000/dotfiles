<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/remotion-to-hyperframes/SKILL.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->


# Remotion to HyperFrames

> **The front door is `/frames`.** Use this **only** to port an existing **Remotion** (React) composition's source into HyperFrames, one way. Authoring a **new** composition, re-creating from a non-Remotion source (After Effects, Framer Motion, plain React / CSS - there is no Remotion source to translate), a passing Remotion mention, or any uncertainty → read `/frames` first: the intent layer owns every route decision.

## Overview

Translate Remotion (React-based) video compositions into HyperFrames (HTML + GSAP) compositions. Most Remotion idioms have direct HyperFrames equivalents - the translation is mechanical for ~80% of typical compositions. This skill encodes the mapping and guards against the lossy 20% by refusing to translate patterns that don't fit HF's seek-driven model and recommending the runtime interop pattern from [PR #214](https://github.com/heygen-com/hyperframes/pull/214) instead.

The skill includes a **tiered fixture corpus** (T1–T4) with upstream measured SSIM baselines. Run `frames.remotion_corpus` on a writable local copy for actual setup, baseline rendering, Numen rendering, SSIM gating, and escape-hatch validation.

## When to use

**Use this skill ONLY when the user explicitly asks to migrate from Remotion.** Example trigger phrases:

- "port my Remotion project to HyperFrames"
- "convert this Remotion code to HyperFrames"
- "migrate from Remotion"
- "translate this Remotion comp"
- "rewrite this as HyperFrames HTML"

**Do NOT use this skill when:**

- (a) The user is authoring a **new** HyperFrames composition, even if they have or are A/B-testing a similar Remotion video.
- (b) The user mentions Remotion in passing without asking for migration.
- (c) The user shares Remotion code as reference material rather than asking for a translation.
- (d) The user asks for "the same video as my Remotion one" without explicitly asking to migrate the source - treat that as a fresh HyperFrames build.

**NOT SUPPORTED (decline - this is not what this skill does):**

- **The reverse direction.** Exporting a HyperFrames composition back out _to_ Remotion (or to any other framework) is not a workflow - the translation is Remotion → HyperFrames only. Say so plainly.
- **Non-Remotion sources.** An After Effects project (`.aep`), a Framer Motion / plain-React / CSS animation, or any other tool's source is not a Remotion composition - there is no Remotion source to translate. Re-create it natively via `/frames → remotion-to-hyperframes/references/general-video.md`, or decline if HyperFrames can't represent it.

When in doubt, default to authoring a native HyperFrames composition with `/frames → remotion-to-hyperframes/references/general-video.md` (the general HyperFrames authoring flow) instead.

## Workflow

### Step 1: Assess the source

Run `frames.remotion_lint {"project": "/absolute/path/to/project", "path": "src", "json": true}` before translation. The Rust source linter scans these patterns, excluding `node_modules`:

- **Blockers** (refuse + recommend interop): `useState`, `useReducer`,
  `useEffect` / `useLayoutEffect` with non-empty deps, async
  `calculateMetadata`, third-party React UI libraries (MUI, Chakra, Mantine,
  antd, shadcn, Radix, NextUI).
- **Warnings** (translate after dropping the construct): `@remotion/lambda`
  config, `delayRender`, `useCallback`, `useMemo`, custom hooks.
- **Info** (translate with note): `staticFile`, `interpolateColors`.

If the returned `blockers` count is nonzero, stop. Read
[escape-hatch.md](remotion-to-hyperframes/references/escape-hatch.md) and surface the finding's recommendation.
Warnings do not stop translation: drop the construct in Step 3 and note the gap
in `TRANSLATION_NOTES.md`.

### Step 2: Plan the translation

Read [`remotion-to-hyperframes/references/api-map.md`](remotion-to-hyperframes/references/api-map.md) - the index of every Remotion API and its HF equivalent or per-topic reference. Identify which topic remotion-to-hyperframes/references you'll need based on what the source uses:

| Source contains                                                           | Load reference                                |
| ------------------------------------------------------------------------- | --------------------------------------------- |
| `Composition`, `defaultProps`, `schema`, `calculateMetadata`              | [`parameters.md`](remotion-to-hyperframes/references/parameters.md)   |
| `Sequence`, `Series`, `Loop`, `AbsoluteFill`, `Freeze`                    | [`sequencing.md`](remotion-to-hyperframes/references/sequencing.md)   |
| `useCurrentFrame`, `interpolate`, `spring`, `Easing`, `interpolateColors` | [`timing.md`](remotion-to-hyperframes/references/timing.md)           |
| `Audio`, `Video`, `Img`, `IFrame`, `staticFile`, `delayRender`            | [`media.md`](remotion-to-hyperframes/references/media.md)             |
| `TransitionSeries`, `@remotion/transitions`                               | [`transitions.md`](remotion-to-hyperframes/references/transitions.md) |
| `@remotion/lottie`                                                        | [`lottie.md`](remotion-to-hyperframes/references/lottie.md)           |
| `@remotion/google-fonts/<Family>`, `Font.loadFont`, `@font-face`          | [`fonts.md`](remotion-to-hyperframes/references/fonts.md)             |

Don't load all of them - load only what the specific source needs.

**Search the live catalog for any visual effect the table does not map.** When the source paints a look with no HF API equivalent - a scanline/CRT overlay, a glitch or chromatic-aberration pass, a shader wipe, a film-grain treatment - run `frames.catalog {"query": "<the effect, in plain English>"}` before hand-writing it in GSAP. The search needs **nothing installed**: no project, no prior `add`, no account. It ranks the local catalog registry (~400 blocks and components) from any directory, and `transitions.md` already takes this route for `clockWipe()` / `iris()` via `frames.add {"project": "/absolute/path/to/project", "name": "sdf-iris"}`. A real component is closer to the source than a hand-approximation, so it usually raises the SSIM rather than lowering it - but the render diff in Step 4 is still the arbiter. Hand-write the effect when a search returns nothing that fits, and record the substitution in `TRANSLATION_NOTES.md` either way.

### Step 3: Generate the HF composition

Emit `index.html` with:

- Root `<div id="stage">` carrying the composition's `data-composition-id`, `data-start="0"`, `data-duration` (in seconds), `data-fps`, `data-width`, `data-height`, plus one `data-*` per scalar prop.
- One host `<div>` per scene with `data-composition-src="compositions/<scene>.html"` and `data-start` / `data-duration` / `data-track-index`. The root holds no nested layout.
- One `compositions/<scene>.html` per scene (a `<template>` sub-composition): its inline `<style>` for layout (CSS sets the `from` state of every animated property), its markup, and one paused `gsap.timeline({paused: true})` in the scene's local time. Every Remotion `useCurrentFrame()` derivation becomes a tween on that timeline at the offset within the scene.
- `window.__timelines["<scene-id>"] = tl;` in each scene file, and `window.__timelines["<composition-id>"]` for the root's own (possibly empty) timeline.

Custom React subcomponents inline as repeated HTML using the prop interface as the template (see [`parameters.md`](remotion-to-hyperframes/references/parameters.md) for the per-instance `data-*` pattern).

### Step 4: Validate

For a visual comparison, render the Remotion baseline using the Remotion CLI
from the user's source project if that project already provides a render
command. This is a user-side Remotion command, not a Numen tool. Render the
HyperFrames translation with `frames.render {"project": "/absolute/path/to/project", "output": "../hf.mp4"}`.
Run `frames.render_diff {"project": "/absolute/path/to/project", "baseline": "baseline.mp4", "translated": "hf.mp4", "output_dir": "diff", "threshold": 0.95}`. Inspect `summary.json` for mean, min, max, p05, p95, frame_count and pass. For failed comparisons run `frames.frame_strip {"project": "/absolute/path/to/project", "baseline": "baseline.mp4", "translated": "hf.mp4", "output_dir": "strip", "samples": 8}` to produce paired frames and timestamps.

Both renders need matching pixel format. Set `Config.setVideoImageFormat("png")`
+ `Config.setColorSpace("bt709")` in the Remotion source's `remotion.config.ts`;
otherwise the diff measures encoder differences (~0.05 SSIM hit), not
translation fidelity.

### Step 5: Document gaps

Anything that didn't translate cleanly (volume ramps dropped, custom presentations approximated, fonts substituted) gets a `TRANSLATION_NOTES.md` written next to the HF output. See [`remotion-to-hyperframes/references/limitations.md`](remotion-to-hyperframes/references/limitations.md) for the format.

## What this skill explicitly does NOT do

- **Translate React state machines.** Compositions that drive animation via `useState` + `useEffect` are not deterministic frame-capture targets in HyperFrames' seek-driven model. Recommend the runtime interop pattern.
- **Run Remotion's render pipeline alongside HyperFrames.** That's the runtime interop pattern from [PR #214](https://github.com/heygen-com/hyperframes/pull/214) - a separate solution for compositions that fail this skill's lint.

(`@remotion/lambda` is _not_ a blocker - Lambda config is deployment, not animation. The skill drops it as a warning and translates the rest. See [`remotion-to-hyperframes/references/escape-hatch.md`](remotion-to-hyperframes/references/escape-hatch.md).)

## How to grade your own translation

Copy `remotion-to-hyperframes/assets/test-corpus/` to a writable local directory, then run
`frames.remotion_corpus {"project": "/absolute/path/to/project"}`. Use `"tier":"tier-4-escape-hatch"`
for lint-only validation without render dependencies. The runner generates T2 assets,
renders real baselines/translations and writes `run-report.json`; skips are not passes.

Validated baseline (as of 2026-04-27):

| Tier | Composition shape                           | Mean SSIM | Threshold |
| ---- | ------------------------------------------- | --------- | --------- |
| T1   | single-element fade-in                      | 0.974     | 0.95      |
| T2   | multi-scene + spring + audio + image        | 0.985     | 0.95      |
| T3   | data-driven, custom subcomponents, count-up | 0.953     | 0.90      |
| T4   | escape-hatch (8 lint cases)                 | rule counts and severity floors | automated lint validation |
