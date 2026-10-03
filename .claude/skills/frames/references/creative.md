<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/hyperframes-creative/SKILL.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->


The frames skill and its references ship with Numen and are projected by `numen sync`.

# HyperFrames Creative

Brand, pacing, style, narration, and composition direction. Use after the technical contract from `frames references/core.md` is in place.

For motion patterns, scene blueprints, transitions, and CSS marker effects, use `frames references/animation.md` - this skill is intentionally non-animation.

> **Read these two FIRST for any non-trivial composition - they override web instincts:**
>
> - `creative/references/house-style.md` - "interpret the prompt, generate real content," the lazy-default list, and the background/foreground layer recipe. This is what turns a literal restyle into a _concept_.
> - `creative/references/video-composition.md` - video-medium scale, depth, and foreground detail. It explains how to avoid empty web-page layouts without imposing a universal element count.
>
> Skipping these is the single biggest cause of generic, web-page-looking output. They are not optional rows in the routing table below - for anything beyond a one-line edit, open both before you choose colors or write HTML.

## Workflow

1. If a project has a design spec, **read it first** and treat its frontmatter tokens as brand truth (colors, fonts, spacing, tone, constraints). Which file to read (precedence `frame.md` → `design.md` → `DESIGN.md`) and how to parse it (frontmatter = normative, prose = context) are defined once in [`creative/references/design-spec.md`](creative/references/design-spec.md) - resolve and load per that doc.
2. If no design spec exists and the user asks for visual direction, choose a route:
   - Ready-made frame-preset (optional) → `creative/frame-presets/` (adopt a `FRAME.md` as `frame.md`; see `creative/references/design-spec.md`)
   - Named style or mood → `creative/references/visual-styles.md`
   - Fast defaults → `creative/references/house-style.md`
   - Interactive selection → `creative/references/design-picker.md`
3. For multi-scene work, plan beats and rhythm before writing HTML → `creative/references/beat-direction.md`. For scene transitions, jump to `frames/references/animation/transitions/`.
4. For motion-heavy work, read `creative/references/motion-principles.md` (high-level guardrails), then go to `frames references/animation.md` for atomic rules.

## Routing

| Topic                                                                                                   | Read                                           |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Adopt a ready-made frame-preset as `frame.md` (optional)                                                | `creative/frame-presets/` · `creative/references/design-spec.md` |
| Default palettes, motion, typography, lazy defaults to question                                         | `creative/references/house-style.md`                    |
| Named style presets, mood-to-style routing                                                              | `creative/references/visual-styles.md`                  |
| Palette-specific color tokens                                                                           | `creative/palettes/*.md`                                |
| Composition patterns - PiP, text-behind-subject, title card, slide show                                 | `creative/references/composition-patterns.md`           |
| Stats / infographic presentation                                                                        | `creative/references/data-in-motion.md`                 |
| Structured expansion for open-ended prompts                                                             | `creative/references/prompt-expansion.md`               |
| Video-medium density, scale, color, frame composition                                                   | `creative/references/video-composition.md`              |
| Per-beat direction, rhythm planning, transition timing                                                  | `creative/references/beat-direction.md`                 |
| Post-authoring spec verification (colors, type, corners, spacing, depth)                                | `creative/references/design-adherence.md`               |
| High-level motion guardrails and GSAP-quality rules                                                     | `creative/references/motion-principles.md`              |
| Font selection, pairings, rendered-video type guardrails                                                | `creative/references/typography.md`                     |
| Story doctrine - hook language, value-before-evidence, storyboard-as-proposal, source-traceable visuals | `creative/references/story-spine.md`                    |
| Script pacing, tone, openings, number pronunciation                                                     | `creative/references/narration.md`                      |
| Precomputed audio bands mapped to motion                                                                | `creative/references/audio-reactive.md`                 |

## Creative audits and audio data

- Contrast audit: run `frames.contrast_report {"project": "/absolute/path/to/project", "samples": 10}`. It hides text paint without changing layout, samples the actual composited background inside each text box, accounts for alpha and text stroke, and reports WCAG AA/AAA results. The tool writes `.hyperframes/contrast/contrast-report.json` and `contrast-overlay.png` (magenta = fails AA, yellow = AA only, green = AAA); set `out`, `width`, `height`, and rational `fps` as needed. `summary.failAA` is the fidelity gate. Run `frames.check` for the broader composition checks.
- Audio-reactive data: run `frames.audio_data {"project": "/absolute/path/to/project", "input": "music.mp3"}` before constructing the timeline. Optional `output` defaults to `audio-data.json`, `fps` to 30, and `bands` to 16. The tool decodes mono 44.1 kHz PCM and extracts independently peak-normalized per-frame RMS and centered 4096-sample Hann FFT peaks in logarithmic 30 Hz–16 kHz bands; see `creative/references/audio-reactive.md` for the output schema. `frames.beats` supplies complementary rhythmic analysis.
- Animation analysis: follow the animation audit in `frames references/animation.md`.

## Boundaries

- Do not override `frames references/core.md` technical rules.
- Do not require a design system for a minimal technical composition.
- Do not add extra scenes, narration, music, captions, or transitions unless the request calls for them or you first propose the expansion.
- Keep recipe creative/references task-specific; do not read every reference for simple edits.
