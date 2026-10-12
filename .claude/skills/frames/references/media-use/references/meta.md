<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/e1925d4317fcd13c0e5799cd4767a3e2dd4c9238/skills/media-use/references/meta.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: ownership mapped to native tools; upstream telemetry and remote services unavailable. -->
# Ownership, usage statistics and privacy

Composition playback belongs to the frames runtime. Media preparation uses the following actual tool routes, not the upstream resolver scripts:

| Capability | Numen route |
| --- | --- |
| Voice generation | `frames.tts` with Kokoro v1.0; `frames.transcribe` for word timing |
| Provided-media inventory | `frames.media_index` |
| Transcript-driven cutting | `frames.transcript_cut` |
| Voice/music ducking and loudness | `frames.audio_duck`, `frames.audio_carve`, `frames.normalize_audio` |
| Treatment authoring/analysis | `frames.media_treatment` |
| Grade comparison and frozen LUTs | `frames.grade_compare`, `frames.lut` |
| Confirmed preferences and approved recipes | `frames.media_prefs`, `frames.media_recipe` |
| Image/icon/logo/BGM/SFX catalog resolution | Unavailable; use supplied assets or an explicitly available host tool |
| Image/video generation and avatar/dub services | Unavailable; do not claim an upstream provider executed |

See `operations.md` for the provided-file workflows. Numen's local inventory and recipe tools do not imply upstream's global content-addressed `~/.media` resolver cache or automatic promotion. `resolve --stats` (including hit rates, misses and date-windowed resolver usage) has no frames tool equivalent.

Upstream's PostHog media-use events, shared HyperFrames install identity, HeyGen account stitching and `X-HeyGen-Client-Source: media-use` request tagging are not implemented by this port. `DO_NOT_TRACK` and `HYPERFRAMES_NO_TELEMETRY` are upstream opt-outs, not a promise about unrelated Numen telemetry. Do not send user intents, paths or account identifiers to an analytics service to imitate upstream behavior. See `telemetry-dashboard.md` for the unavailable dashboard boundary.
