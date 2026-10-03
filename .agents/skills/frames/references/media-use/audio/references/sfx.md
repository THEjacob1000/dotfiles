<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/media-use/audio/references/sfx.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: unavailable asset search procedure removed. -->
# Sound effects (SFX)

SFX search and resolution are not available in Numen. Use audio supplied by the user. Place effects at the intended transition or action, keep them below narration and music, and avoid duplicating one effect for distinct events when it would sound unnatural.

Record each placed effect in `audio_meta.json` `sfx[]` as `{ "id": "<line or scene id>", "name": "whoosh", "file": "assets/sfx/whoosh.mp3", "offset_s": 0, "duration_s": 0.57, "volume": 0.35 }`.

- **Volume ~0.35.** SFX must sit under narration and BGM, not fight them.
- **No file → skip, don't fail.** A missing effect is noted and the build moves on; never a render blocker.
- **One asset per distinct name.** Reuse one file across many cues.
