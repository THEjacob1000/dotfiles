<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/hyperframes/references/routes/remotion-to-hyperframes.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# Route: frames references/remotion-to-hyperframes.md

- **Input:** Existing Remotion React source, only when the user explicitly asks to port, convert, or migrate it. A passing Remotion mention is not a trigger.
- **Output:** A HyperFrames HTML composition translated from the source and compared with the Remotion render through the migration evaluation harness.
- **Triggers:** "port my Remotion project", "convert this Remotion composition", "migrate from Remotion".

## Interview

- Not served by the intent layer — a migration with no brief. Route directly.
