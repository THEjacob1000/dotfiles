<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/e1925d4317fcd13c0e5799cd4767a3e2dd4c9238/skills/media-use/references/setup-providers.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: unavailable asset-provider and remote-service setup procedures removed. -->
# Available media workflows

Asset search and resolution for BGM, SFX, images, icons, official logos, and fonts are not available in Numen. Use assets supplied by the user. HeyGen-hosted TTS and other cloud TTS are not available; use local narration through `frames.tts` with Kokoro v1.0 (54 voice ids; default `af_heart`), then `frames.transcribe` if word-level timing is needed.

For grading and visual treatments, use `frames.media_treatment` and `frames.grade_compare`; local parametric cube generation, validation, and supplied-file ingestion use `frames.lut` (see `grading.md`). Local inventory, preferences, and approved recipes use `frames.media_index`, `frames.media_prefs`, and `frames.media_recipe`. Exact image/MP4 error diffusion uses `frames.dither`. See `operations.md` for other provided-file operations.
## Unavailable upstream provider routes

HeyGen host-gateway billing (`HEYGEN_API_BASE`, `HEYGEN_API_KEY`, loopback `HEYGEN_ALLOW_HTTP`), host-injected OAuth (`HEYGEN_ACCESS_TOKEN`), HeyGen CLI catalog search/sign-in, avatar video, Starfish narration and voice cloning/listing/deletion are unavailable in Numen. Those environment variables do not enable remote tools. ElevenLabs and Gemini narration are also unavailable. If a user explicitly asks for one of these providers, state the missing route and preserve their choice rather than silently substituting Kokoro; a supplied recording can still be placed and transcribed. For BGM/SFX, use supplied assets or an actually available host music/sound tool; do not redirect to unavailable HeyGen sign-in.

