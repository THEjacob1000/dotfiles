<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/e1925d4317fcd13c0e5799cd4767a3e2dd4c9238/skills/media-use/references/setup-providers.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: unavailable asset-provider and remote-service setup procedures removed. -->
# Available media workflows

Use supplied local BGM, SFX, images, icons, logos, fonts, and narration recordings. Use `frames.transcribe` when word-level timing is needed.

For grading and visual treatments, use `frames.media_treatment` and `frames.grade_compare`; local parametric cube generation, validation, and supplied-file ingestion use `frames.lut` (see `grading.md`). Local inventory, preferences, and approved recipes use `frames.media_index`, `frames.media_prefs`, and `frames.media_recipe`. Exact image/MP4 error diffusion uses `frames.dither`. See `operations.md` for other provided-file operations.
## Local assets

Stage supplied files in the project and preserve their provenance. Use supplied BGM/SFX or an actually available host music/sound tool. Asset catalogs, avatar video, and remote sign-in are not available through the frames tools.

