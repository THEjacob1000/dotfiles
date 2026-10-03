<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/media-use/audio/references/bgm.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: unavailable asset search and music generation procedures removed. -->
# Background music (BGM)

BGM catalog search and generated-music workflows are not available in Numen. Use a music file supplied by the user. When mixing it under narration, keep the voice intelligible; check that the chosen excerpt covers the composition and use fades to avoid abrupt starts and endings.

Record the supplied track in `audio_meta.json` as `{ "path": "assets/bgm/track.mp3", "volume": 0.12, "duration_s": 42.0 }`. Use `0.12` (about -18 dB, a bed under the voice) under narration and `0.9` for a silent film with no voice; an explicit `volume` always overrides these defaults.

For short launch videos, do not assume the beginning of the supplied file is the best edit point. Check the opening against later five-second sections. If the track starts with a quiet build but a later section has a stronger, clean musical entrance, trim from that section and apply a short fade-in and longer fade-out. Repeat this check whenever the composition duration changes; the final music file must cover the full cut without a silent tail.
