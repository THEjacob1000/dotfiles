<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/motion-graphics/categories/lower-thirds/module.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# lower-thirds — category module

<!-- registry-items: allow= -->

**The live search is the source of truth for what the registry has.** The tables below are hand-maintained samples and under-cover by design: run `frames.catalog {"query": "<what you want>"}` before concluding the registry lacks something. Item names are kept aligned with the local registry.

**Name/title bars, callouts, social overlays** — graphics meant to sit over other footage. Asset-free (+ optional logo). Usually `export: alpha-overlay` (transparent). ~3–6s (or loop/hold).

## Plan (Director)

`content`: `{ name, role, position (lower-left / lower-third / corner), brand_colors[] }`. Default `export: alpha-overlay`.

## Vocabulary / leans on

- Blocks: `caption-*` (pill-karaoke, neon-accent, editorial-emphasis) + registry **overlay** blocks (`instagram-follow`, `tiktok-follow`, `yt-lower-third`, `x-post`, `spotify-card`, `macos-notification`).
- Primitives: slide/wipe-in · bar reveal · `glow` · fade/slide-out.

## Build (reuse-first)

Reuse the closest overlay/caption block + set name / role / handle / brand colors / position; **or** hand-author a bar that wipes in (`scaleX` from 0, `transform-origin:left`) with text sliding up behind it, hold, slide out. **Transparent background** (`export: alpha-overlay` → `render --format webm/mov`) so it composites over footage. Keep it in the title-safe lower band.
