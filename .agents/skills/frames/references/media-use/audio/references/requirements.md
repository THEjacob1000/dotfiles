<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/media-use/audio/references/requirements.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# Requirements & Caches

## Credentials

Numen's audio tools need no credential. Upstream's provider chain (HeyGen TTS and BGM/SFX retrieval, ElevenLabs, Lyria, Kokoro, MusicGen) and its `auth` sign-in are not available in Numen.

## Engines and system dependencies

- **TTS** — `frames.tts` runs native Rust Candle CUDA Qwen3-TTS-12Hz-1.7B-Base full ICL from Numen's voice asset tree, with reference audio/transcript and seed in `models/qwen3-voice.json`. Provision pinned assets with `assets/voice/fetch.sh`; no Python runtime TTS.
- **CUDA build/runtime** — build `cargo build --release -p numen-mcp --features cuda` with the system CUDA 13 toolkit (`sudo apt-get install cuda-toolkit-13-0` after configuring NVIDIA's apt repository), never pip toolkit wheels. Runtime uses BF16 CUDA device 0 and requires a compatible NVIDIA GPU/driver and CUDA libraries. Default CPU-only tooling builds fail closed for synthesis. `cargo check -p numen-voice --features qwen-model` typechecks without a toolkit but cannot synthesize.
- **Transcribe** — `frames.transcribe` runs the bundled `whisper-cli` (whisper.cpp) with a Whisper model from the same asset tree. Model size depends on the choice (75 MB – 3.1 GB).
- **Loudness and mixing** — `ffmpeg` and `ffprobe` on PATH.
- **BGM, SFX, background removal** — not available in Numen.

Run `frames.doctor` if a tool fails because of a missing dependency.
