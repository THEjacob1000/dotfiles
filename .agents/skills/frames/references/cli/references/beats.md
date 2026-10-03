<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/hyperframes-cli/references/beats.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# Generate a project beat grid

Use `frames.beats` when an existing HyperFrames project needs the Studio-compatible beat file for its music track. This is a CLI utility, not a complete video workflow.

```bash
frames.beats {"project": "/absolute/path/to/project"}
frames.beats {"project": "/absolute/path/to/project"}
frames.beats {"project": "/absolute/path/to/project"}
```

The project must contain a local music `<audio>` source. Mark it with `data-timeline-role="music"`; an id containing `music`, `bgm`, or `soundtrack` is also recognized. The command analyzes that file in headless Chrome and writes `beats/<audio-relative-path>.json`.

If no beats are detected, the command fails and writes nothing. If Chrome is unavailable, run:

```bash
frames.browser {"action": "ensure"}
```

For a complete beat-synced video, route through `/frames → references/music-to-video.md`. That workflow owns a different audio-driven pipeline and its `audiomap.json`; do not replace its analyzer with this Studio utility.
