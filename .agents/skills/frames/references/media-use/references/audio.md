<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/media-use/references/audio.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# Audio engine — voiceover, music, SFX, captions, transcription

Upstream runs a full audio pass (TTS voiceover + background music + sound effects in one shot) through a shared engine script that reads `audio_request.json` and writes `audio_meta.json`. Numen has no tool for that engine. Do the same pass with the tools that exist and keep the same file contract, so workflows that read `audio_meta.json` keep working:

1. **Voice:** for each line, `frames.tts {"text": "<line text>", "output": ".media/audio/voice/<id>.wav"}` (see `audio/references/tts.md`).
2. **Timings:** `frames.transcribe {"input": ".media/audio/voice/<id>.wav"}` for each voice file.
3. **Loudness:** `frames.normalize_audio` when the voice and any supplied music need matching levels.
4. **Write `audio_meta.json`** (id-keyed) by hand: `voices[].{path,duration_s,words[]}` (duration measured with `ffprobe`, words from step 2), `sfx[]`, `bgm`, `total_duration_s`.

- **Request** shape upstream: `{ provider?, voice?, lang?, speed?, tts_model?, style?, lines: [{ id, text, style?, sfx?: [names] }], bgm: { mode?, query?, prompt? } }`. `id` joins each line back to your model. Only `lines[].id`, `lines[].text` and `speed` have a Numen meaning.
- **Music and SFX:** BGM retrieval or generation and SFX retrieval are not available in Numen. Use music and effects the user supplies, placed under `.media/audio/{bgm,sfx}` and recorded in `audio_meta.json`.
- **Providers:** HeyGen, ElevenLabs and Gemini narration are remote services and not available in Numen.

Transcription uses `frames.transcribe` (whisper.cpp; see `references/operations.md`). Background removal is not available in Numen. Captions follow the per-topic guides in `audio/references/` (`tts.md`, `transcribe.md`, `captions/`).
