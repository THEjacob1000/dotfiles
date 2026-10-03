<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/motion-graphics/categories/charts/module.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# charts — category module

Animated **data-viz** from data. Asset-free (the "input" is the data). "One chart, one message" for short durations.

## Plan (Director)

`content`: `{ type: bar|line|pie|race|pct, data[], labels[], headline, axes: bool }`. For `race`, data must be cumulative/time-staged.

## Vocabulary / leans on

- Block: **`data-chart`** (animated **bar + line**, staggered reveal, value labels — proven: borrowed + customized + rendered to MP4 in the prototype `charts-demo`).
- Also in the registry: **`bar-chart-race`** — install it rather than hand-authoring a race.
- Gaps (hand-author): **pie / donut, ring/%** — no registry block covers these. Search first (`frames.catalog {"query": "pie chart reveal"}`), then use D3/visx for data→geometry + GSAP for motion.
- Signature animations: bar stagger-grow · line `stroke-dashoffset` draw-on · pie radial sweep · ring fill · KPI count-up · race reorder.

## Build (reuse-first)

Reuse `data-chart`: `frames.add {"project": "/absolute/path/to/project", "name": "data-chart"}` → edit the data arrays, scales, headline, labels, and palette in place (its data is baked in the script, not a variables flag). Axes are hidden by default; show them muted only when magnitude is the message. Determinism: drive animation from the seek clock, never wall-clock.

## Dashboard-skeleton variant

For a **product-dashboard** case: lay out a skeleton dashboard - a top bar with a real test logo (for example, the HyperFrames logo in `samples/_assets/`) and a title, then a grid of 3–4 KPI cards (each a `stat` count-up) plus one `data-chart` panel. Reveal order: header/logo in, cards stagger in, then the chart animates. This composes the `stat` and `charts` primitives inside a dashboard frame; the logo is a frozen project-local asset.
