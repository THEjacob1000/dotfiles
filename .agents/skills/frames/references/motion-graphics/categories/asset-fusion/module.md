<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/motion-graphics/categories/asset-fusion/module.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# asset-fusion — category module (search-driven · the net-new IP)

**A real asset's geometry _becomes_ the chart** — RWA diegetic fusion (the straw becomes a gauge; a glass's liquid becomes a pie). Not in any catalog; the genuinely net-new capability. ~5–8s.

## Source (Step 2)

Use one user-supplied **hero asset** with strong geometric affordance (asset search and generation are not available in Numen). `asset_needs`: `{ kind: image, query|generate, treatment: cutout|none }`. Freeze it project-local.

## Plan (Director Part 2) — the fusion logic

1. Classify the **data type** (temporal / quantitative / proportion / spatial).
2. Read the asset's **geometric affordance** — linearity → timeline/gauge · volume/texture → pie · height → bar · container → exploded view.
3. `element_positions`: **GROUND with `frames.locate` — never eyeball pixel coordinates.** Read `grounding/PROTOCOL.md`; call `overlay`, inspect every touched strip, call `region` with `vids`/`hids`, inspect the cropped six-strip guide, and call `final` with its returned region and fine strip IDs. Call `mark` with the returned normalized box and verify the red rectangle on the original before using the box and center.
4. **Eyedropper palette** from the asset (never generic #FFF/#000).

## Highlight + circle recipe (the common case)

"Ring / spotlight object X in a real image" → use the drop-in template **`samples/asset-fusion/_ref-circle-highlight.html`**: set `CFG.box` (from the locate protocol), `CFG.label`, `CFG.asset`, EVEN `CFG.W/H`, `CFG.mode` (`full` = ring+connector+label+brackets+scanlines, `circle` = ring only). It computes the radial wash, the amber double over-stroke ring, connector, callout, and corner-bracket reticle from the box. The whole pipeline is: locate (PROTOCOL.md) → fill template → render.

## Render gotchas (codified — skipping these breaks the render)

- **EVEN width & height** — odd width _or height_ (e.g. 1400×933) → `ffmpeg` encode fails / distorts. Resize the asset/stage to even dims (1400×932).
- **`data-width`/`data-height` must be STATIC HTML attrs on the stage** — the renderer's StaticGuard reads them at compile time, before JS runs. Setting them via `setAttribute` is too late → render falls back to portrait 1080×1920 and distorts. (The circle-highlight template now hard-codes them; keep them equal to `CFG.W/H`.)
- **Draw-on (`stroke-dashoffset`) must be `autoAlpha:0`-gated** — `getTotalLength()` can read 0 before layout → dash disabled → a solid line shows at t=0. Gate every draw-on element with `autoAlpha:0` until it draws, and fall back `getTotalLength() || <const>`.
- **CSS var tween scope** — `gsap.to(":root", {"--x":..})` won't reach an element that has its own inline `--x`; tween the var on the element itself.
- **No camera push under a fixed overlay** — scaling the image while the ring/wash stay fixed drifts the target out of the ring. Either skip the push or scale the whole scene together.
- Lossless delivery: `--format mov` (ProRes); `mp4` is lossy.

## Vocabulary / leans on

- Borrow the annotation kit from registry **`north-korea-locked-down`** (hand-drawn scribble circle draw-on, pop-up label + pointer, editorial wash, camera push).
- Primitives: gauge fill / marker-rise along the affordance · connector (data → asset point) · diegetic chart fused to the asset's geometry.
- Adapt the diegetic chart to each asset's affordance (read the geometry, fuse the data into it).

## Build (reuse-first + hand-author the affordance)

**Two layers**: asset (z0, full-bleed) + data graphics (z1+) fused to its geometry, anchored by `element_positions`; connectors/scribble physically tie the data to the asset; asset stays visible. Reference impl: the prototype `fusion-demo/index-annotated.html` (straw → gauge + borrowed annotation kit).
