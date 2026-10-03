<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/hyperframes/references/routes/product-launch-video.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# Route: frames references/product-launch-video.md

- **Input:** A website URL; a script or brief that names a site; or a product-launch script with no derivable site or an explicit "do not scrape" instruction. Capture website assets and brand tokens unless the brief selects no-capture mode. Ask whether supplied script copy is verbatim voice-over or may be restructured.
- **Output:** A product promo, launch video, site tour, or showcase MP4. Sweet spot 30–90s; hard cap about 3 minutes. A show-it-as-is brief features captured screens rather than inventing a separate route.
- **Triggers:** "launch video for X", "promo for our site", "turn this script into a 60s promo", "text-only launch video", "turn this website into a video", "site tour from this URL".

## Interview

- **First, sell or show?** One question when the request doesn't say: market the product (a promo), or show the site as-is (a tour / showcase)? A show-it answer is **intent, not a different pipeline**: write it into `BRIEF.md` (`## Intent` / `## Customizations` — "feature the site's own captured screens as the video's assets") and the workflow's normal steps carry it — the captured screens become the featured `asset_candidates`.
- **Must-haves:** **angle** — story shapes from the site's / brief's own positioning, recommend one with its basis · **length** — 30–90s sweet spot, scaled to the material · **destination** — YouTube / embed → 16:9 · X / LinkedIn / Instagram feed → 1:1 · Shorts / TikTok → 9:16.
- **Conditional:** a show-it-as-is ask adds **what to show** — the whole site, or specific pages/sections (into `BRIEF.md`'s body); a pasted script/brief adds **`VO_MODE`** (verbatim or restructured?); a script that only names a site adds **capture?** — crawl it for brand + assets (default), or text-only / "don't scrape" (no-capture mode, a preset supplies the design system).
- **Pitch round:** `message` + `angle`, after sell-or-show is settled — the pitches inherit that intent.
- **Run-shape:** both.
