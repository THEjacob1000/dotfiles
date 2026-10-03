<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/media-use/references/setup-providers.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: unavailable asset-provider and remote-service setup procedures removed. -->
# Available media workflows

Asset search and resolution for BGM, SFX, images, icons, official logos, and fonts are not available in Numen. Use assets supplied by the user. HeyGen-hosted TTS and other cloud TTS are not available; use local narration through `frames.tts` with the Numen voice, then `frames.transcribe` if word-level timing is needed.

For grading and visual treatments, use `frames.media_treatment` and `frames.grade_compare`; local parametric cube generation, validation, and supplied-file ingestion use `frames.lut` (see `grading.md`). Local inventory, preferences, and approved recipes use `frames.media_index`, `frames.media_prefs`, and `frames.media_recipe`. Exact image/MP4 error diffusion uses `frames.dither`. See `operations.md` for other provided-file operations.
