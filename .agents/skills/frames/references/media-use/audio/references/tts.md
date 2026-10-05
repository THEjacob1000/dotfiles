<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/media-use/audio/references/tts.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# Text To Speech

`frames.tts` synthesizes locally with the Numen voice: native Rust Candle CUDA Qwen3-TTS-12Hz-1.7B-Base full in-context cloning. It generates each scene in one call using reference audio plus the exact reference transcript, without a Python sidecar. It has one voice, `numen`, which is also the default, and returns no word timestamps; run `frames.transcribe` on its output when you need timings.

```bash
frames.tts {"text": "Welcome to HyperFrames", "output": "narration.wav"}
frames.tts {"text": "script.txt", "voice": "numen", "speed": 1.1, "output": "narration.wav"}
```

Provision with `assets/voice/fetch.sh`, then configure `models/qwen3-voice.json`
under the supplied voice asset root (`model_dir`, `codec_dir`,
`reference_audio`, exact `reference_text`, `language`, `seed`). The approved
default is round3 variant a: Son of the Exiles, full ICL, seed 42. Reference
WAVs are mono 24 kHz PCM16 or float. The acquisition manifest records model
and recording checksums, durable source URLs and reuse-rights limits.

Build with `cargo build --release -p numen-mcp --features cuda` using the
system CUDA 13 toolkit from NVIDIA's apt repository (`cuda-toolkit-13-0`),
not pip toolkit wheels. Runtime requires a supported NVIDIA GPU/driver,
CUDA libraries and `ffmpeg` on PATH; no CPU or alternative-voice fallback.
Without the toolkit, `cargo check -p numen-voice --features qwen-model` only
typechecks the model path and does not enable synthesis.

Publication requires strict zero-mismatched-word verification. Up to four
deterministic takes use fixed seeds 42, 43, 44, 45. Config `seed` must be 42
as a validation/identity contract, not a tunable setting. Exhaustion reports
the mismatched words rather than publishing a bad take. Successful audio uses
measured gain plus true-peak limiting, targeting -16 LUFS and -1.5 dB true
peak with mono 24 kHz PCM16 output.

Upstream's other routes are not available in Numen: HeyGen (Starfish) TTS with native word timestamps and its bundled `heygen-tts` helper, ElevenLabs, and Gemini narration through the shared audio engine all call remote provider APIs, and Numen has no tool for them. Kokoro's 54 voices, its voice-prefix language selection and `espeak-ng` multilingual phonemization do not apply to the Numen voice. Upstream's docs-site narrator rule (one ElevenLabs voice for every video on hyperframes.heygen.com) applies only to HeyGen's own docs and is dropped.

## When the Numen voice fits

| Goal                                   | Use                                                         |
| -------------------------------------- | ----------------------------------------------------------- |
| Offline, no API key, fast iteration    | `frames.tts`                                                |
| A voice the user recorded or supplied  | Place their file directly; transcribe it for timings        |
| A specific provider voice or language  | Not available in Numen; ask the user for a recorded take    |

## Speed

- `0.7-0.8` — tutorial, complex content, accessibility
- `1.0` — natural pace (default)
- `1.1-1.2` — intros, transitions, upbeat content
- `1.5+` — rarely appropriate, test carefully

`frames.tts` honors `speed` (greater than 0, at most 3).

## Long scripts

Past a few paragraphs, write the text to a `.txt` file and pass the path. Inputs over ~5 minutes of speech may benefit from splitting into segments.

## Word-timestamp shape

Run `frames.transcribe {"input": "narration.wav", "model": "small.en"}` on the narration to get the flat shape the captions pipeline expects:

```json
[
  { "id": "w0", "text": "Hi", "start": 0.0, "end": 0.21 },
  { "id": "w1", "text": "there", "start": 0.22, "end": 0.55 }
]
```

Review the timings against the actual audio; transcription is estimated alignment, not native TTS timestamps. Do not distribute words evenly across a clip.
