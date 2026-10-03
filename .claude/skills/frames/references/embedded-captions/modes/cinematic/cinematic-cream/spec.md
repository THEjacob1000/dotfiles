<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/embedded-captions/modes/cinematic/cinematic-cream/spec.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# cinematic-cream — spec

The authoritative spec lives in [template.html](template.html)'s header comment (DNA-only:
what's LOCKED vs OPEN, the LAYOUT/planes contract, READING ORDER + hand-off, hero sizing).
Read that header before authoring plan.json. Quick contract:

- LOCKED: Inter, soft/present motion, warm-cream palette, screen blend, shadow logic.
- OPEN per group (css field): size/weight/style/transform/spacing + position WITHIN a plane.
- LAYOUT: `frames.caption_safe_zones {"project": "/absolute/path/to/project"}` derives heuristic scene regions from supplied `frames_fg/` mattes. Otherwise inspect sampled source frames and use foreground placement. Automatic matting remains unavailable.
- plan.json: groups[] with per-word transcript timings. Run `frames.caption_fill_timings {"project": "/absolute/path/to/project"}`, then `frames.caption_composition {"project": "/absolute/path/to/project"}` to generate composition HTML; `frames.caption_cinematic` lowers authored cinematic blocks to the plan automatically.
