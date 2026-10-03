<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/hyperframes/references/routes/faceless-explainer.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# Route: frames references/faceless-explainer.md

- **Input:** A topic, article, notes, or arbitrary text being explained, with no product being marketed and no website to capture.
- **Output:** A faceless explainer MP4 with invented typography, abstract graphics, diagrams, or data visualization. Sweet spot 30–90s; hard cap about 3 minutes.
- **Triggers:** "faceless explainer about X", "explain how DNS works as a video", "turn this article into an explainer".

Before writing scripts or narration, ground every shown or narrated symbol, file, and behaviour. Write a lesson spec whose steps carry `code_refs` (`{"path": "<file relative to the workspace root>", "item_path": "<module, type or method path>"}`), then pass it to `frames.init` with the authored lesson object as `spec` and the absolute repository path as `workspace_root`. The lesson tool resolves each ref against the workspace and fails on any it cannot ground; script narration and code on screen only from the grounded source it returns. Fix or drop a ref that fails rather than narrating from memory.

## Interview

- **Must-haves:** **angle** — concept / how-to / listicle / narrative, recommend the one the text's own shape suggests · **length** — inside the 30–90s sweet spot, scaled to how much the text actually teaches · **destination** — YouTube / embed → 16:9 · X / LinkedIn / Instagram feed → 1:1 · Shorts / TikTok → 9:16.
- **Conditional:** a pasted script adds **`VO_MODE`** — use it verbatim, or restructure per scene?
- **Pitch round:** `message` + `angle` — five tellings of the same topic are five different videos.
- **Run-shape:** both.
