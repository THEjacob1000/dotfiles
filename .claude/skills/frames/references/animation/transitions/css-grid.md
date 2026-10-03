<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/hyperframes-animation/transitions/css-grid.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
## Grid

### Grid Dissolve

Grid of colored cells covers the frame in a ripple from center. Scene swaps at 50% coverage. Cells fade out in ripple.

**12-cell** (4x3, each 480x270): standard
**120-cell** (12x10, each 160x108): dense variant — lower opacity (0.75), tighter ripple

Cells are created dynamically in JS, sorted by distance from center for ripple stagger.
