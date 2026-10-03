<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/motion-graphics/categories/logo-reveal/module.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# logo-reveal — category module

A **logo sting / brand lockup**. The logo is user-supplied (upstream's brand-logo resolution is not available in Numen); `asset_needs` = one logo `source`. ~3–5s. Often `export: alpha-overlay` (sting to drop on other footage).

## Plan (Director)

`content`: `{ logo: <asset path>, tagline, url }`. Envelope: brand palette (or eyedropper from the logo), elegant pacing.

## Vocabulary / leans on

- Block: **`logo-outro`** (piece-by-piece assembly + glow bloom + tagline fade + URL pill).
- Rules: `rules/svg-path-draw` (draw-on for vector logos) · `rules/scale-swap-transition` · `rules/3d-text-depth-layers`.
- Primitives: draw-on / mask-reveal / particle-assemble · `glow` bloom · `underline_sweep` · hold.

## Build (reuse-first)

Reuse `logo-outro` + swap logo / tagline / url / palette; **or** hand-author: place the logo at its hero frame (CSS), reveal via draw-on (SVG `stroke-dashoffset`) or mask/scale, add a glow bloom + accent underline sweep, hold. For an SVG logo, prefer draw-on; for a raster logo, mask/scale + glow. Transparent bg when exporting as an overlay.
