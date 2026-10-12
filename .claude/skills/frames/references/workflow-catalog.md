<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/e1925d4317fcd13c0e5799cd4767a3e2dd4c9238/skills/hyperframes/references/workflow-catalog.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# Workflow catalog

Each workflow's input/output/trigger contract lives in its own route file — one
small read per candidate instead of a whole catalog:

`references/routes/<workflow>.md` — e.g. `routes/product-launch-video.md`,
`routes/general-video.md`, `routes/remotion-to-hyperframes.md`.

The same file carries that route's interview entry (must-haves, conditionals, deferred
asks, run-shape), so confirming a route is exactly one read.
