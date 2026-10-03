<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/motion-graphics/grounding/PROTOCOL.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# Locate a target in an image without a detector dependency

The contract used by each consumer (such as an asset-fusion ring) is:

`locate(image, target-description) -> { box: [x0,y0,x1,y1], center: [cx,cy] }`

Coordinates are normalized to 0..1. Do not eyeball target coordinates; choose numbered grid strips, then reconstruct the rectangle from those discrete choices.

## Routing

Use `frames.locate` for the detector-free grid loop. The author still inspects each guide and selects the strips; the tool never guesses a target or calls a detector service.

## Grid procedure

1. `frames.locate {"project": "/absolute/path/to/project", "command": "overlay", "image": "assets/shot.png", "out": "grounding"}` writes `gv.png` (vertical strips) and `gh.png` (horizontal strips), defaulting to nine strips. Inspect both and list every strip touched by the unique target.
2. `frames.locate {"project": "/absolute/path/to/project", "command": "region", "image": "assets/shot.png", "vids": [4, 5], "hids": [6, 7], "out": "grounding"}` pads the selection by 0.4 strip, crops/upscales it to at least 640 pixels wide, and writes the numbered six-strip `gc.png`. Inspect it and select the finer strips.
3. `frames.locate {"project": "/absolute/path/to/project", "command": "final", "image": "assets/shot.png", "region": [0.2889, 0.5111, 0.6, 0.8222], "vids": [3, 4], "hids": [3, 4]}` reconstructs the full-image normalized box and center with 0.25 fine-strip padding and four-decimal rounding. Use the actual region returned in step 2.
4. `frames.locate {"project": "/absolute/path/to/project", "command": "mark", "image": "assets/shot.png", "box": [0.3796, 0.6018, 0.5093, 0.7315], "out": "grounding/check.png"}` draws a six-pixel red rectangle on the original. Use the actual box from step 3; inspect the result and repeat region/final if it misses. Never skip this visual check.

## Ambiguity

Resolve ambiguous target descriptions before localizing. Use a unique description (for example, "the right-most drum"); ask the user if necessary.

## Output contract

The tool produces the grid guides, cropped/upscaled fine-grid guide, normalized box and center, and marked original. Strip counts can be changed with `n` and `nf`; all strip IDs remain one-based.

## Consumer

`samples/asset-fusion/_ref-circle-highlight.html` uses `CFG.box` directly.
