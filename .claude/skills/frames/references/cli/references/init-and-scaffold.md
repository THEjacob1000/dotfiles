<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/hyperframes-cli/references/init-and-scaffold.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# init, capture

<!-- registry-items: allow=blank,landscape-4k,portrait-4k,square-4k,frames references/product-launch-video.md,frames references/core.md,frames references/media-use.md -->

Scaffolding commands. Use these instead of creating files by hand — they set up the right file structure, copy media, and run transcription.

## init

```bash
frames.init {"project": "/absolute/path/to/project"}                                    # centered blank; never prompts
frames.init {"project": "/absolute/path/to/project", "example": "warm-grain"}               # pick an example
frames.init {"project": "/absolute/path/to/project", "resolution": "portrait"}
frames.init {"project": "/absolute/path/to/project", "video": "/absolute/path/to/clip.mp4"}                   # with video file
frames.init {"project": "/absolute/path/to/project", "audio": "/absolute/path/to/track.mp3"}                  # with audio file
frames.init {"project": "/absolute/path/to/project", "tailwind": true}                         # Tailwind v4 browser runtime
frames.init {"project": "/absolute/path/to/project"}                  # CI, same blank
```

**Never prompts**: `frames.init` scaffolds the centered blank unless you pass `"example"` to start from a named example.

Templates: `blank`, `warm-grain`, `play-mode`, `swiss-grid`, `vignelli`, `decision-tree`, `kinetic-type`, `product-promo`, `nyt-graph`. (The closed set of `hyperframes:example` items in `registry/registry.json` plus the bundled `blank` template. `frames.catalog` does not list examples — its `--type` takes only `block` or `component` — so this list has no live equivalent.)

Other useful flags:

- `--resolution` — preset: `landscape` (1920×1080), `portrait` (1080×1920), `landscape-4k`, `portrait-4k`, `square` (1080×1080), `square-4k`. Aliases: `1080p`, `4k`, `uhd`, `1080p-square`, `4k-square`.
- `skill` records the owning authoring workflow in `hyperframes.json`, for example `frames references/product-launch-video.md`.
- `--skip-transcribe` — don't auto-transcribe `--audio` / `--video` with Whisper.
- `--model`, `--language` — Whisper model / language for the auto-transcription.

When using `tailwind`, read the `frames references/core.md` Tailwind reference before editing classes or theme tokens. The scaffold uses the Tailwind v4 browser runtime.

When `--audio` or `--video` is supplied, `init` transcribes the file with Whisper. For voice/model selection see the `frames references/media-use.md` skill.

All project and input media paths must be absolute. Lesson-mode init (`spec` with `workspace_root`) rejects `example`, `video`, `audio`, `tailwind` and `resolution`; those options belong only to standalone scaffolding.

## capture

```bash
frames.capture {"project": "/absolute/path/to/project", "url": "https://stripe.com"}                  # scaffold from a website
frames.capture {"project": "/absolute/path/to/project", "url": "https://linear.app", "output": "linear-video"}  # custom output directory
frames.capture {"project": "/absolute/path/to/project", "url": "https://example.com"}          # JSON output for agents
frames.capture {"project": "/absolute/path/to/project", "url": "https://example.com", "skip_assets": true}   # skip image/SVG download
frames.capture {"project": "/absolute/path/to/project", "url": "https://example.com", "max_screenshots": 12}
frames.capture {"project": "/absolute/path/to/project", "url": "https://example.com", "timeout": 60000} # page-load timeout in ms
frames.capture {"project": "/absolute/path/to/project", "url": "https://example.com", "capture_budget": 90000} # post-navigation budget
```

Captures a live URL as an editable HyperFrames project: screenshots become layered scenes, assets are downloaded locally, and the result is a normal project you can `lint` / `preview` / `render`. Use this when the user supplies a URL as the starting point for a video.

`--timeout` bounds page navigation; `--capture-budget` is the separate cooperative budget for work
after navigation (fonts, assets, vision, and contact sheets). The latter is not a hard wall-clock
watchdog and cannot interrupt native work already in flight. An outer caller deadline is therefore a
third, distinct timeout. An outer caller timeout leaves the capture result unknown; it does not prove
HyperFrames hung or that the navigation timeout should be increased. Preserve the last phase and
classify the boundary that fired. Optional AI image captioning is unavailable.

The JSON tool result includes `ok`, warnings and `lastPhase`; there is no separate phase-record stream or blocked marker file.

Treat an MCP error or JSON `ok: false` as a hard stop. Do not render, build or infer brand/design data from a failed capture's partial artifacts. Successful capture still needs usable artifacts for the owning workflow's gate; file existence alone is not semantic success. Retry into a fresh output directory, never merge a failed attempt's partial output.

## skills

There is no skills command in Numen: the frames skill and its references ship with Numen and are projected into each coding agent by `numen sync`.
