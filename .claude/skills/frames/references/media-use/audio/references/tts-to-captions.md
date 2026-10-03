<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/media-use/audio/references/tts-to-captions.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# TTS → Captions

When no recorded voiceover exists, generate one and obtain word-level caption timing. Upstream's single-call HeyGen path (audio plus word timestamps in one response) is a remote service and not available in Numen, so there is one path: TTS, then transcription.

## TTS → transcription

The Numen voice supplies audio without word data. Generate the audio, then transcribe:

```bash
frames.tts {"text": "script.txt", "output": "narration.wav"}
frames.transcribe {"input": "narration.wav", "model": "small.en"}
```

Whisper extracts precise word boundaries from the generated audio, so caption timing matches delivery without hand-tuning. Match `model` to the narration's language (`small.en` for English, `small` with `"language": "<code>"` otherwise). Then consume `transcript.json` via the caption references.

Verify that transcription preserved the script, especially names, numbers, and delivery pauses. If `words` is empty, resolve the transcription failure before captioning. Generate and align again after changing the read.
