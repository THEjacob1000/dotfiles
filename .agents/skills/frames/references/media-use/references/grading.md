<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/media-use/references/grading.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# Color grading — grade blocks and LUTs

Use `grade` when you need a canonical HyperFrames grading/effects payload for
an `<img>` or `<video>`. Core presets and params-backed LUT entries resolve
locally; future CDN-backed LUT entries require network unless already
frozen. Persist a decided payload with `frames.media_treatment` rather than editing HTML by
hand:

For a vague but explicit polish request, do not jump directly from intent to a
preset name. Read `media-treatments.md`, choose a treatment whose subject and
avoid rules match the actual media, apply its conservative base with only
justified bounded tuning, then complete its visual verification steps. A named
owned treatment uses the exact preset/payload in its recipe; do not run the
generic grade/LUT resolver first.

Stop here and use that treatment workflow for requests such as retro, old home
video, camcorder, film, print, ASCII, glitch, privacy, or a media reveal. Do not
assemble those from a generic LUT plus handmade CSS vignette/grain/opacity.

**Never `cat`/read a `.cube` file into context.** A 3D LUT is ~size^3 lines of raw numbers (33^3 ≈ 36k lines at the default size). It bloats context and carries zero human/agent-legible signal. To understand or choose a LUT, use `frames.grade_compare` to see it rendered. Read `.media/index.md` or `luts/index.json` for the description. Never read the LUT body itself.

Numen has no tool for upstream's grade resolver (`media-use resolve --type grade`). Write the preset-first payload below by hand, choosing from the presets that `frames.media_treatment {"capability": "grading"}` lists.

Preset-first output uses the core runtime vocabulary and does not freeze a file:

```json
{
  "preset": "warm-daylight",
  "intensity": 1
}
```

Apply that payload to one unambiguous real media element:

```bash
frames.media_treatment {"project": "/absolute/path/to/project", "file": "index.html", "selector": "#hero", "grading": {"preset": "warm-daylight", "intensity": 1}, "apply": true}
```

Pass `"dry_run": true` before writing when scope is uncertain and `"clear": true` to remove
the treatment. The low-level persisted result is still normal HTML:

```html
<video
  class="clip"
  src="./media/scene.mp4"
  data-color-grading='{"preset":"warm-daylight","intensity":1}'
></video>
```

Direct attribute authoring is a fallback for environments where `frames.media_treatment` is not
available, not the primary agent workflow.

To build a treatment that is not already represented by a recipe, inspect the
canonical toolbox first:

```bash
frames.media_treatment {"capabilities": true}
```

It reports a concise family map. Read `"capability": "grading"` for the processing
order, then request only the focused family needed to get its legal controls
and ranges from Core. Compose one nested payload and pass it back through
`frames.media_treatment`; the command rejects unknown keys before
mutation. Do not generate or hand-edit a LUT merely to combine controls already
owned by the realtime shader.

For seek-safe effect motion, animate only the runtime-supported CSS properties
on that same real media element with its registered paused GSAP timeline:

| CSS property                       | Range   |
| ---------------------------------- | ------- |
| `--hf-color-grading-intensity`     | 0 to 1  |
| `--hf-color-grading-lut-intensity` | 0 to 1  |
| `--hf-color-grading-exposure`      | -2 to 2 |
| `--hf-color-grading-blur`          | 0 to 1  |
| `--hf-color-grading-bloom`         | 0 to 3  |
| `--hf-color-grading-kuwahara`      | 0 to 1  |
| `--hf-color-grading-pixelate`      | 0 to 1  |
| `--hf-color-grading-ascii`         | 0 to 1  |
| `--hf-color-grading-dither`        | 0 to 1  |

Author the initial value directly in the media element's inline `style`, then
use finite `tl.to()` keyframes. Do not use a frame-zero `tl.set()`, CSS
animation clocks, timers, random values, or `onUpdate` callbacks. The static
`data-color-grading` payload remains the fallback and source of the other
controls.

For a reusable color transform beyond the preset vocabulary, reference a validated
`.cube` under `.media/luts/` from the block:

Use `frames.lut {"project": "/absolute/path/to/project", "params": {"temperature": 0.18, "contrast": 0.08, "saturation": 0.04}, "type": "grade"}` to generate, validate, freeze, and inventory a deterministic local `.cube`. The default edge size is 33; `"size"` accepts 2–64.

```json
{
  "intensity": 1,
  "lut": { "src": ".media/luts/grade_001.cube", "intensity": 0.85 }
}
```

Use `frames.lut {"project": "/absolute/path/to/project", "intent": "warm cinematic", "type": "lut"}` for technical intent words, or pass explicit `"params"`. To validate and ingest a supplied cube, pass `"from": "look.cube"`; `"validate_only": true` validates without writing. 1D and mixed cubes are rejected. Hosted LUT downloads and remote asset resolution remain unavailable.

Parametric math (`buildCube`) cannot reproduce real film stocks or emulsion
transforms. Use a real scanned `.cube` the user supplies for those.

For visual selection, write candidate grade payloads (presets, or user-supplied
LUTs) to a `grades.json`, run
`frames.grade_compare {"project": "/absolute/path/to/project", "for": "<frame>", "grades": "grades.json"}`, then apply the
winner with `frames.media_treatment` as the final `data-color-grading` block.

For media already selected in a composition, use `frames.media_treatment` with `"analyze": true`
when you need side-effect-free `ffmpeg`/`ffprobe` signalstats evidence. It
returns source metadata, HDR/unknown-LOG warnings, and a bounded `adjust`
suggestion without modifying the composition. The suggestion is a starting
point for visual review, not an automatic neutralization of intentional color.

```bash
frames.media_treatment {"project": "/absolute/path/to/project", "file": "index.html", "selector": "#hero", "analyze": true}
```

For an unbound source file Numen has no analysis tool (upstream `resolve --type grade --for ... --analyze`); place the file in a composition and analyze it there.

Library LUT entries live in `luts/index.json`. Each entry keeps `id`,
`description`, `tags`, and `intensity`, then supplies either compact `params`
for on-demand `buildCube(params)` generation or a direct CDN `url` for future
scanned `.cube` files. Do not commit generated `.cube` bodies. Pass the selected entry's compact `params` to `frames.lut` for local deterministic generation; CDN-only entries require a user-supplied file.
