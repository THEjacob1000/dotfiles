<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/e1925d4317fcd13c0e5799cd4767a3e2dd4c9238/skills/media-use/audio/references/requirements.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# Requirements & Caches

## Credentials

Numen's audio tools need no credential. Supply narration recordings, music, and sound effects as local files.

## Engines and system dependencies

- **Transcribe** — `frames.transcribe` runs the bundled `whisper-cli` (whisper.cpp) with a Whisper model from the configured asset root. Model size depends on the choice (75 MB – 3.1 GB).
- **Loudness and mixing** — `ffmpeg` and `ffprobe` on PATH.
- **Background removal** — not available in Numen.

Run `frames.doctor` if a tool fails because of a missing dependency.
