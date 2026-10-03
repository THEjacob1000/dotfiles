<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/embedded-captions/modes/cinematic/README.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: native caption tools replace upstream scripts; automatic matting remains unavailable. -->
# Cinematic mode (pure embed) — one engine, six DNAs

> Cinematic mode describes one composition design through **[engine.html](engine.html)**.
> `frames.caption_cinematic` compiles this design. Subject-occluded output requires supplied matte frames in `<project>/frames_fg/`; Numen does not generate mattes. The old per-template HTML shells are retired; `cinematic-cream` maps to `dna: "cream"`.

Use this mode for pure-embed asks (no rail): brand film, hype, social reel, showcase.
The **DNA** locks the visual language (type, palette scheme, blend, motion grammar, hero three-act). Run `frames.caption_safe_zones {"project": "/absolute/path/to/project"}` on supplied mattes to derive heuristic scene regions; otherwise assess source samples and use foreground placement.

## Workflow

1. Use `frames.transcribe {"project": "/absolute/path/to/project"}` and inspect word timings. When supplied `frames_fg/` mattes exist, run `frames.caption_safe_zones {"project": "/absolute/path/to/project"}`. Automatic matting remains unavailable.
2. Pick a DNA ([../../dna/README.md](../../dna/README.md)): bright hero band → `ink`,
   else by register (cream / editorial / keynote / documentary / loud). Recommend, let
   the user pick.
3. Author `<project>/cinematic.json` - `"dna": "<name>"` + thought-blocks, using the
   documented schema in [../../../embedded-captions.md](../../../embedded-captions.md).
4. Run `frames.caption_cinematic {"project": "/absolute/path/to/project"}` to generate `<project>/plan.json` and composition HTML from the transcript and authored blocks.
5. `frames.caption_preview {"project": "/absolute/path/to/project"}` → § Visual QA (failure checks + the 5 positive checks in [../../references/reference-bar.md](../../references/reference-bar.md)).
6. Run `frames.caption_check` gates, then `frames.caption_render {"project": "/absolute/path/to/project"}` and inspect the composite.

## What the compiler generates

- word timings from the transcript; accumulate-within-block / page-flip-between-blocks
- the hero hand-off + **three-act orchestration** (dim → RMS-coupled per-letter entrance
  → breathe + glow), per the DNA's `hero` block
- scene tokens: `--accent` (sampled), contact shadow, depth blur
- reading order, re-slot from measured heights, hero size/collision post-pass

Inspect the generated files and preview before rendering; scene analysis and subject occlusion depend on supplied mattes, not an installed ML model.

## What you DON'T do

- Override `.cap` color / blend / shadow / filter / motion curves - that's the DNA.
  Scene fights the look → pick a different DNA (bright → `ink`), never recolor.
- Numen has no automatic background matting; do not claim subject occlusion without supplied matte frames.

## Adding a DNA

`dna/<name>.json` — copy one, change the voice (see [../../dna/README.md](../../dna/README.md)
§ Adding). The engine consumes it with no code change. A DNA must be a distinct voice
with a reason to exist, not a recolor.
