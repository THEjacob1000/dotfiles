<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/hyperframes-animation/SKILL.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->


The frames skill and its references ship with Numen and are projected by `numen sync`.

# HyperFrames Animation

All motion knowledge in one skill: **rules** (atomic recipes), **blueprints** (multi-phase scene templates), **transitions** (scene-to-scene), **techniques** (broader motion-design patterns), and **adapters** (per-runtime APIs).

For the composition contract (data attributes, sub-compositions, determinism) see `frames references/core.md`.

## Default: compose atomic animation/rules

Pick 2-4 animation/rules from `animation/rules-index.md`, glue them together with a single paused GSAP timeline, done. This is faster and produces less code than starting from a blueprint.

## Load a blueprint when

- The scene matches an existing pre-designed multi-phase template (brand-reveal, social-proof, etc.) and reusing its phase pipeline saves real authoring time
- You want runnable ground-truth code for a complex 4-5 phase choreography

Blueprints live in `animation/blueprints-index.md`. Each entry points to `animation/blueprints/<id>.md` (recipe). Do not read it speculatively; load it when you've already decided you need scene-level orchestration.

## Routing

| Want to…                                                                       | Read                                                |
| ------------------------------------------------------------------------------ | --------------------------------------------------- |
| Pick an atomic motion pattern by trigger / tag                                 | `animation/rules-index.md`                                    |
| Read one rule's full HTML / CSS / GSAP recipe                                  | `animation/rules/<name>.md`                                   |
| Pick a multi-phase scene template                                              | `animation/blueprints-index.md`                               |
| Read one blueprint's full recipe                                               | `animation/blueprints/<id>.md`                                |
| Author a scene transition (CSS-driven, between two clips)                      | `animation/transitions/overview.md`, `animation/transitions/catalog.md` |
| Look up a broader motion-design technique                                      | `animation/techniques.md`                                     |
| Motion blur - shutter smear on an element, and when not to use it              | `animation/references/motion-blur.md`                         |
| Analyze an existing composition's animation map                                | Animation audit below                              |
| GSAP API - timeline / tweens / position parameters                             | `animation/adapters/gsap.md`                                  |
| GSAP - drop-in effect recipes                                                  | `animation/rules/gsap-effects.md`                             |
| GSAP - transforms / perf                                                       | `animation/adapters/gsap-transforms-and-perf.md`              |
| GSAP - eases / stagger                                                         | `animation/adapters/gsap-easing-and-stagger.md`               |
| GSAP - timeline / labels                                                       | `animation/adapters/gsap-timeline-and-labels.md`              |
| Lottie / dotLottie (After Effects exports, `window.__hfLottie`)                | `animation/adapters/lottie.md`                                |
| Character animation (walk cycle, mascot, jointed puppet, gestures)             | `animation/adapters/lottie.md` → Characters                   |
| Three.js / WebGL (3D scenes, `AnimationMixer`, `hf-seek`)                      | `animation/adapters/three.md`                                 |
| Anime.js (`window.__hfAnime`)                                                  | `animation/adapters/animejs.md`                               |
| CSS keyframes (`animation-delay` / `play-state` / `fill-mode`)                 | `animation/adapters/css-animations.md`                        |
| Web Animations API (`element.animate()`, `currentTime` seek)                   | `animation/adapters/waapi.md`                                 |
| TypeGPU / WebGPU (`navigator.gpu`, WGSL, compute pipelines)                    | `animation/adapters/typegpu.md`                               |
| HTML-as-texture + WebGL/GLSL post-fx (capture live DOM via `drawElementImage`) | `animation/adapters/html-in-canvas-patterns.md`               |
| Named text-animation effects (24 IDs via external `animate-text` skill)        | `animation/adapters/animate-text.md`                          |

## Picking a runtime

- **GSAP** is the default for 95% of motion work - covers timeline orchestration, transforms, easing, stagger. All atomic animation/rules in this skill are GSAP-based.
- **Lottie** when an asset has its own pre-baked timeline (typically After Effects exports), including characters that walk, gesture or react.
- **Three.js** for 3D scenes, camera motion, shader-driven visuals.
- **Anime.js** for lightweight tweening when GSAP is overkill.
- **CSS** for simple repeated motifs, decoration, shimmer - no JavaScript animation cost.
- **WAAPI** for native browser keyframes without a GSAP dependency.
- **TypeGPU / WebGPU** for GPU-rendered canvases (particles, liquid glass, custom shaders).

Multiple runtimes can coexist in one composition. Each registers its instances on the runtime-specific global so HyperFrames can seek all of them in one pass.

## Critical Constraints

**Prerequisite: `frames references/core.md` → Non-Negotiable Rules** (single paused timeline, `data-duration` governs length, no `Math.random` / `Date.now` / `performance.now`, no `repeat: -1` without a finite root `data-duration`, no page-load `gsap.set` on later-scene clips, no `display` or raw `visibility` tweens, and no timeline construction inside `async` / `setTimeout` / `Promise`). GSAP `autoAlpha` and zero-duration visibility sets at explicit timeline boundaries remain allowed by core. Use those exceptions only on non-clip elements or wrappers inside a clip; the framework owns `.clip` lifecycle. Don't restate the full contract here.

Animation-craft additions on top of core's contract:

- **Pre-calculated layout constants** - never derive positions from `getBoundingClientRect()` at tween time. Tween-time DOM measurements desync because the renderer samples in parallel; compute coordinates once at composition setup and reuse.
- **Spatial motion uses GSAP transform aliases only** (`x`, `y`, `scale`, `rotation`). Core's allowlist also permits `opacity` / `color` / `backgroundColor` / `borderRadius` for non-spatial property tweens - but never `width` / `height` / `top` / `left` for layout changes.

## Animation audit

Use `frames.animation_map {"project": "/absolute/path/to/project", "frames": 6, "min_duration": 0.15}` for the choreography audit. Use `frames.timeline`, `frames.lint`, and `frames.check` for composition structure and runtime warnings.

The animation map enumerates registered GSAP DOM tweens and non-DOM `onUpdate` drivers, samples six midpoint bounding boxes per retained DOM tween in the browser, and reports properties, easing, collisions, pacing flags, stagger spacing, element lifecycles, motion density, dead zones, and visible-element snapshots. Drivers contribute motion spans but never fabricated geometry or element lifecycles. Tweens shorter than `min_duration` are counted separately. The tool writes `<composition-dir>/.hyperframes/anim-map/animation-map.json`; set `out`, `width`, `height`, and integer or rational `fps` when needed. Use `frames.snapshot` for visual stills.

## See Also

- `frames references/core.md` - composition structure, data attributes, sub-compositions, deterministic render contract
- `frames references/creative.md` - palettes, typography, narration, beat planning (non-animation creative direction)
- `frames references/cli.md` - `frames.lint`, `frames.check`, `frames.snapshot`, `frames.preview`, and `frames.render`
