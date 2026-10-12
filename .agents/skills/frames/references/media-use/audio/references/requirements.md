<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/e1925d4317fcd13c0e5799cd4767a3e2dd4c9238/skills/media-use/audio/references/requirements.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# Requirements & Caches

## Credentials

Numen's audio tools need no credential. Upstream's provider chain (HeyGen TTS and BGM/SFX retrieval, ElevenLabs, Lyria, MusicGen) and its `auth` sign-in are not available in Numen.

## Engines and system dependencies

- **TTS** — `frames.tts` runs native Kokoro v1.0 ONNX Runtime CPU synthesis with all 54 voice ids (default `af_heart`, speed `1.0`). Provision pinned model/voice assets with `bash assets/voice/fetch.sh` from the repository root (verified `kokoro-v1.0.onnx` and `voices-v1.0.bin` under `assets/voice/models`). Native phonemization reads the system `espeak-ng-data` files from `[frames].espeak_data_dir` in the Numen config (default `/usr/lib/x86_64-linux-gnu/espeak-ng-data`). `numen sync` passes that config to `numen-mcp` via `--config`; standalone servers take `numen-mcp --config <path>`. No Python, reference recording, CUDA toolkit or GPU is required. See `tts.md`.
- **Transcribe** — `frames.transcribe` runs the bundled `whisper-cli` (whisper.cpp) with a Whisper model from the same asset tree. Model size depends on the choice (75 MB – 3.1 GB).
- **Loudness and mixing** — `ffmpeg` and `ffprobe` on PATH.
- **BGM, SFX, background removal** — not available in Numen.

Run `frames.doctor` if a tool fails because of a missing dependency.
