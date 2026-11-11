<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/e1925d4317fcd13c0e5799cd4767a3e2dd4c9238/skills/media-use/references/audio.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# Audio engine — voiceover, music, SFX, captions, transcription

Prepare supplied narration, music, and sound effects with local tools, then author the `audio_meta.json` contract consumed by captions and assembly:

1. **Voice:** stage supplied recordings under `.media/audio/voice/<id>.wav`, retaining their sample rate and channels.
2. **Timings:** `frames.transcribe {"project": "/absolute/path/to/project", "input": ".media/audio/voice/<id>.wav"}` for each voice file.
3. **Loudness:** `frames.normalize_audio` when the voice and any supplied music need matching levels.
4. **Write `audio_meta.json`** by hand with frame-ID-keyed `voices` containing each recording's `path`, measured `duration_s`, and `words` from transcription; include supplied `sfx`, `bgm`, and `total_duration_s`. Match scene IDs to the storyboard. See the owning workflow's assembly contract for track fields.

Use supplied music and effects under `.media/audio/{bgm,sfx}`. Match storyboard scene durations to measured recordings, and preserve voice/BGM metadata when adding SFX.

Transcription uses `frames.transcribe` (whisper.cpp; see `operations.md`). Set `language` for the recording and choose a matching model. Keep authored script words canonical, align them to measured transcript spans, and review names, numbers and pauses. Captions follow `../audio/references/transcribe.md` and `../audio/references/captions/`.
