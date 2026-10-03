<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/motion-graphics/phases/source/guide.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# source phase — asset sourcing (asset-first)

Runs **only when `shot-plan.json.asset_needs` is non-empty** (the form categories never reach here). Sources each needed asset → a **frozen project-local path** + a ledger (`assets/index.md`). Uses `/frames → references/media-use.md` for asset prep and `frames.capture` for a given page. Asset search and generation (upstream frames references/media-use.md `resolve`) are not available in Numen, so a need with no user-supplied asset **degrades to asset-free** (see below).

## Per asset_need

- `image / icon / logo / svg` → **user-supplied**. Upstream searched (Google Images / SerpAPI + Noun Project) or generated these through frames references/media-use.md `resolve`; that is not available in Numen. Optional `treatment`: recolor / vectorize (cutout needs background removal, which is not available).
- `news / web / tweet` → **RWA-style search** with the agent's own web search when it has one, or `frames.capture` for a given URL. Two-pole queries: **atomic** (1–3 words, composable) or **specific** (5–15 words: a news event / tweet); never the middle. A failed specific query is dropped, not broadened.

## Steps

1. Read `asset_needs` from `shot-plan.json`.
2. For each: **analyze → search → review (use/maybe/reject — selection is the hard part; do NOT take the first/generated result) → freeze** the kept asset into `assets/` (rehost remote URLs).
3. Write `assets/index.md` — agent-readable ledger: `role → frozen path + provenance`.
4. For `asset-fusion`: also capture the asset's measurable geometry (so Director Part 2 can set `element_positions`) + an eyedropper palette.

## Degrade gracefully

If a provider / search is unavailable, mark the need unmet in `context.log`; the category falls back to asset-free where possible (e.g. `news` → typographic headline without the sourced image).

The project-local outputs are frozen assets under `assets/` and an `assets/index.md` ledger mapping role to path and provenance. There is no Numen asset-resolve tool.
