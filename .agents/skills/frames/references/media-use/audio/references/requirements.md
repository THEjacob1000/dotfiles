<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/media-use/audio/references/requirements.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# Requirements & Caches

## Credentials

Numen's audio tools need no credential. Upstream's provider chain (HeyGen TTS and BGM/SFX retrieval, ElevenLabs, Lyria, Kokoro, MusicGen) and its `auth` sign-in are not available in Numen.

## Engines and system dependencies

- **TTS** — `frames.tts` runs the Numen voice (numen-voice's Chatterbox engine) from Numen's voice asset tree. If the voice is not installed, the tool says where it looked.
- **Transcribe** — `frames.transcribe` runs the bundled `whisper-cli` (whisper.cpp) with a Whisper model from the same asset tree. Model size depends on the choice (75 MB – 3.1 GB).
- **Loudness and mixing** — `ffmpeg` and `ffprobe` on PATH.
- **BGM, SFX, background removal** — not available in Numen.

Run `frames.doctor` if a tool fails because of a missing dependency.
