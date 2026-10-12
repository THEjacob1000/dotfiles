<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/e1925d4317fcd13c0e5799cd4767a3e2dd4c9238/skills/media-use/audio/references/tts-to-captions.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# TTS → Captions

When no recorded voiceover exists, generate one and obtain word-level caption timing. Upstream's single-call HeyGen path (audio plus word timestamps in one response) is a remote service and not available in Numen, so there is one path: TTS, then transcription.

## TTS → transcription

Kokoro supplies audio without word data. Generate the audio, then transcribe:

```bash
frames.tts {"project": "/absolute/path/to/project", "text": "script.txt", "output": "narration.wav"}
frames.transcribe {"project": "/absolute/path/to/project", "input": "narration.wav", "model": "small.en"}
```

Whisper/ASR estimates word boundaries from the generated audio; these are timing evidence, not canonical caption text or native TTS timestamps. Keep the authored script words as the canonical text, aligning them to measured ASR spans. Review timing against delivery and correct it when necessary. Match `model` to the narration's language (`small.en` for English, `small` with `"language": "<code>"` otherwise). Then consume the aligned words via the caption references.

Verify that transcription preserved the script, especially names, numbers, and delivery pauses. If `words` is empty, resolve the transcription failure before captioning. Generate and align again after changing the read.
