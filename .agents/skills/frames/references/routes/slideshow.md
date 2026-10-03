<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/hyperframes/references/routes/slideshow.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# Route: slideshow

- **Input:** A brief, outline, or existing page to author as a presentation, pitch deck, or interactive deck. If "slides", "deck", or "convert this page" is ambiguous, confirm that the user wants a HyperFrames slideshow before authoring.
- **Output:** A runnable HyperFrames composition plus the JSON island used by `SlideshowController`: discrete slides, fragment reveals, branching, hotspots, presenter mode, and speaker notes. The deliverable is a navigable deck, not an MP4.
- **Triggers:** "make a pitch deck", "interactive presentation", "convert this page into slides", "slideshow with presenter mode".

## Interview

- The one question is the routing confirmation itself — "do you want this as a HyperFrames slideshow?" — asked during triage (it survives every mode: wrong routing is a quality problem). The deck contract owns everything after.
- **Run-shape:** neither — the deliverable is a navigable deck, not a rendered video.
- **Front-door capability offer:** skip it. After route confirmation, the deck workflow owns all remaining choices.
