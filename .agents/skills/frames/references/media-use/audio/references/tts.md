<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/e1925d4317fcd13c0e5799cd4767a3e2dd4c9238/skills/media-use/audio/references/tts.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands mapped to frames tools; native Kokoro replaces remote providers. -->
# Text To Speech

`frames.tts` synthesizes locally with Kokoro-82M v1.0 using native ONNX Runtime CPU inference and Rust phonemization. Choose any of the 54 pinned v1.0 voice ids; default `af_heart`, speed `1.0`. Synthesis writes mono 24 kHz PCM16 WAV. It returns no native word timestamps: measure the final audio and transcribe it for word timing. No Python sidecar or remote API is used.

```json
{"text":"Welcome to HyperFrames.","output":"/absolute/path/to/narration.wav"}
{"project":"/absolute/path/to/project","text":"script.txt","voice":"bf_emma","speed":1.1,"output":"narration.wav"}
{"text":"Bonjour.","voice":"ff_siwis","lang":"fr","output":"/absolute/path/to/narration-fr.wav"}
```

Send these arguments to `frames.tts`. With `project`, script and output paths can be relative; without it output must be absolute. A whitespace-free `.txt` path is read as a script. From the repository root, provision the pinned model and voices with `bash assets/voice/fetch.sh`: it places SHA-256-verified `kokoro-v1.0.onnx` and `voices-v1.0.bin` under `assets/voice/models` from the pinned `model-files-v1.0` release. Native phonemization needs the system `espeak-ng-data` dictionary/phoneme files (the Debian `espeak-ng-data` package), not an executable or shared-library sidecar. Set their directory with `[frames].espeak_data_dir` in the Numen config (default `/usr/lib/x86_64-linux-gnu/espeak-ng-data`); `numen sync` passes it to `numen-mcp` via `--config`, and standalone servers take `numen-mcp --config <path>`. GPU/CUDA and reference recordings are not required.

## Voice selection

| Content | Curated voices |
| --- | --- |
| Product demo | `af_heart`, `af_nova` |
| Tutorial | `am_adam`, `bf_emma` |
| Marketing | `af_sky`, `am_michael` |
| Documentation | `bf_emma`, `bm_george` |
| Casual/social | `af_heart`, `af_sky` |

The complete accepted set (there is no separate voice-list tool):

```text
af_alloy af_aoede af_bella af_heart af_jessica af_kore af_nicole af_nova
af_river af_sarah af_sky am_adam am_echo am_eric am_fenrir am_liam
am_michael am_onyx am_puck am_santa bf_alice bf_emma bf_isabella bf_lily
bm_daniel bm_fable bm_george bm_lewis ef_dora em_alex em_santa ff_siwis
hf_alpha hf_beta hm_omega hm_psi if_sara im_nicola jf_alpha jf_gongitsune
jf_nezumi jf_tebukuro jm_kumo pf_dora pm_alex pm_santa zf_xiaobei zf_xiaoni
zf_xiaoxiao zf_xiaoyi zm_yunjian zm_yunxi zm_yunxia zm_yunyang
```

The first letter selects phonemization language: `a` American English, `b` British English, `e` Spanish, `f` French, `h` Hindi, `i` Italian, `j` Japanese, `p` Brazilian Portuguese, `z` Mandarin. Optional `lang` on `frames.tts` overrides the phonemizer language, like upstream `--lang`. Listen to the actual result. Phonemes match kokoro-onnx: raw eSpeak IPA retains stress and punctuation, filters to the Kokoro vocabulary and collapses whitespace. Audio uses kokoro-onnx trimming with a 0.25-second sentence pause and a 0.1-second clause pause.

## Speakable scripts and pacing

Keep delivery directions out of spoken text. Write the transcript as sentences a person would say, not slide headings or visual instructions; spell out ambiguous acronyms, symbols, figures and units where necessary. Preview the actual pronunciation rather than assuming the display spelling is speakable. Provider-specific Gemini `style` and per-line delivery instructions have no Kokoro tool argument; express pacing through sentence structure, punctuation and supported `speed`.

For instructional narration, upstream's 145–155 words-per-minute guidance is a useful starting target, with breathing room between sentences. Measure the produced audio rather than treating word count as timing. Place the visual payoff on the spoken beat, leave a readable final hold, and carve any music bed against the voice. Upstream's approximate −31 LUFS music level is a starting reference, not a substitute for listening or the measured mix.

- `0.7–0.8`: tutorials, complex material, accessibility.
- `1.0`: natural pace, default.
- `1.1–1.2`: intros, transitions, upbeat delivery.
- `1.5+`: rarely appropriate; listen carefully.

Native Kokoro accepts speed `0.5..2.0`. For scripts past a few paragraphs, pass a `.txt` file; split long narration into scene segments when useful. Measure every segment and base scene timing on those measurements.

## Normalization and word timing

`frames.normalize_audio` measures loudness and returns safe authored gain without rewriting source media. `frames.narrate` bakes each take to -16 LUFS by default (`target_lufs` overrides). Kokoro synthesis produces mono 24 kHz WAV; supplied `audio` lines keep their sample rate and channels. It transcribes the normalized take and records measured durations and word timings; Whisper's temporary 16 kHz analysis copy is not the delivered WAV. Its transcription language defaults from the voice prefix: a/b→en, e→es, f→fr, h→hi, i→it, j→ja, p→pt, z→zh. `language` overrides this; set it for non-English supplied recordings, and non-English languages use a multilingual Whisper model. `frames.tts` synthesizes only; pass the matching `language` to a separate `frames.transcribe` call for its output.

```json
{"input":"/absolute/path/to/narration.wav","model":"small.en"}
```

Send this to `frames.transcribe` for English. Use an appropriate multilingual model/language for other voices. Word records have the flat caption shape:

```json
[
  {"id":"w0","text":"Hi","start":0.0,"end":0.21},
  {"id":"w1","text":"there","start":0.22,"end":0.55}
]
```

Review timings against the actual audio. Transcription is estimated alignment, not native TTS timestamps; never distribute words evenly across a clip.

## Unavailable remote routes

HeyGen Starfish TTS (including OAuth or a host gateway), its native word timestamps, cloned-voice creation/listing/deletion, ElevenLabs and Gemini narration are unavailable in Numen. A request explicitly selecting one of these providers does not authorize substituting Kokoro: state the missing route and use a supplied recording only when that meets the request. Upstream's fixed ElevenLabs River narrator for hyperframes.heygen.com is a HeyGen docs-site policy, not a Numen default. Custom voice cloning is not a Kokoro feature.
