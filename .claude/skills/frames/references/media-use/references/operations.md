<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/media-use/references/operations.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# Media operations: agent guidance

frames references/media-use.md does not wrap every operation on an asset (cutting,
reframing, stitching, transforming) as a bespoke command. Instead it points you
at the right local tool (decision OP1). Keep each output under `.media/`; use
`frames.media_index` with `project` to regenerate the inventory. Its optional
`record` appends a local asset (`id`, `type`, `path`, `source`, `description`).

All tools below are local and free. ffmpeg is assumed present (it backs the
engine already).

## Cut / trim: keep a slice

```bash
ffmpeg -i in.mp4 -ss 00:00:12 -to 00:00:20 -c copy out.mp4   # 0:12–0:20, no re-encode
```

In-composition trimming usually needs **no new file**: a clip plays a sub-window
via `data-media-start` + `data-duration` (see frames references/core.md). Only cut a
physical file when exporting/assembling outside the composition.

## Reframe / crop: change aspect ratio

```bash
# 16:9 -> 9:16, crop centered
ffmpeg -i in.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" out.mp4
```

For a non-destructive crop, set a `clip-path` on the element in the composition
itself (render-time, source file untouched) instead of re-encoding with ffmpeg.

## Montage / stitch: join clips

```bash
printf "file '%s'\n" a.mp4 b.mp4 c.mp4 > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy out.mp4
```

## Silence-cut / highlight: trim dead air, grab the best moment

```bash
auto-editor in.mp4 --edit audio:threshold=4% -o tight.mp4   # pip install auto-editor
scenedetect -i in.mp4 detect-adaptive list-scenes           # pip install scenedetect
```

## Transforms

| Op                 | Local                                              |
| ------------------ | -------------------------------------------------- |
| Background removal | not available in Numen                             |
| Upscale            | `realesrgan-ncnn-vulkan -i in.png -o out.png -s 4` |
| Lipsync (dub)      | not available (HeyGen service)                     |
| Translate          | not available (HeyGen service)                     |

## Exact error-diffusion dither

Use `frames.dither` with `project` and options `input`, `out`, `algorithm`, `palette`,
`point_size`, `brightness`, `contrast`, and `detail`. It processes images and MP4
video (preserving audio) with exact Floyd-Steinberg, Atkinson, Jarvis-Judice-Ninke,
Stucki, Burkes, Sierra, two-row Sierra, or Sierra Lite error diffusion. This is
distinct from the realtime Bayer `effects.dither` shader in `frames.media_treatment`.

To animate the transformation, keep the original and processed
files as two real media layers and use the seek-safe GSAP timeline to reveal or
crossfade between them. Use the realtime Bayer shader instead when the dither
amount itself must animate continuously.

## Transcription

`frames.transcribe` is the local transcription path. It runs whisper.cpp (99
languages) and returns word timestamps (`[{ id, text, start, end }]`), feeding
transcript cuts, captions, and the audio engine directly.

```bash
frames.transcribe {"input": "talk.mp4"}
```

Upstream's Parakeet engine and its `models install` download are not available in Numen.

## Text-based editing (transcript cut)

Call `frames.transcript_cut` with `project`, `transcript`, and the edits:
`remove: "12-15"`, `remove_words: "12-18,40-41"` (zero-based, inclusive),
`remove_fillers: "um,uh,like"`, and/or `cut_silence: 0.8`. Alternatively,
`keep: "0-5,8-12"` names kept ranges and is mutually exclusive with removals.
`plan: true` returns the kept segment array without ffmpeg. Segments shorter
than 0.2 seconds are dropped; silence cuts retain 0.15 seconds beside each word.

To export, also provide `input` and `out`. The tool smooths interior splices with
30 ms audio ramps, uses PCM intermediates, encodes audio once at concat, and
atomically replaces the output. `copy: true` is fade-free and keyframe-snapped;
the result reports `copy_drift` when the output differs from kept time by over
one second. Inside a composition, the planned ranges can instead become clips
with `data-media-start` and `data-duration`.

## Ducking (declare in-composition / bake for export)

B1, declare ducking in the composition as a volume lane in a `data-automation`
attribute on the background `<audio>` element; the source file stays untouched.
Call `frames.audio_duck` with `project`, `meta: "audio_meta.json"` (or a word
transcript), `target: "#bgm"`, and optionally `composition: "index.html"` to read
the target's `data-volume` and `data-start`. The result contains `spans`,
`keyframes`, and a clip-local `lane`; put the lane JSON in `data-automation`.
Defaults are `duck: 0.25`, `attack: 0.15`, `release: 0.4`, and `merge_gap: 0.6`.
Ramps begin at each speech boundary. Multiple file-relative voice lines require
`sequential: true` (optional `gap`) or explicit `offsets: "l1=0,l2=3.4"`.

```html
<!-- auto-duck: #bgm under narration; add to its <audio> element -->
data-automation='{"version":1,"lanes":[{"target":"volume","points":[{"t":0,"v":0.6},{"t":3.42,"v":0.6},{"t":3.57,"v":0.15},{"t":9.87,"v":0.15},{"t":10.27,"v":0.6}]}]}'
```

B2, bake ducking only for exported or standalone files.

```bash
ffmpeg -i bgm.mp3 -i voice.wav \
  -filter_complex "[0][1]sidechaincompress=threshold=0.03:ratio=8:attack=200:release=400[ducked]" \
  -map "[ducked]" bgm.ducked.wav
```

Declare inside compositions. Bake only for assets leaving the hyperframes
pipeline.

## Publish loudness

Two-pass `loudnorm` measures first, then applies the measured values with the
target LUFS baked in.

Socials target, -14 LUFS:

```bash
ffmpeg -i mix.wav \
  -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json \
  -f null -

ffmpeg -i mix.wav \
  -af loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=<input_i>:measured_TP=<input_tp>:measured_LRA=<input_lra>:measured_thresh=<input_thresh>:offset=<target_offset>:linear=true:print_format=summary \
  mix.social.wav
```

Podcast target, -16 LUFS:

```bash
ffmpeg -i mix.wav \
  -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json \
  -f null -

ffmpeg -i mix.wav \
  -af loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=<input_i>:measured_TP=<input_tp>:measured_LRA=<input_lra>:measured_thresh=<input_thresh>:offset=<target_offset>:linear=true:print_format=summary \
  mix.podcast.wav
```

## Generate: images and video

Asset generation (upstream `resolve --type image|video`: local FLUX and LTX model
ladders, codex image generation, HeyGen avatar and image-to-video) is not
available in Numen. Use images and video the user supplies.

## HEVC / H.265 sources

HEVC/H.265 sources need no conversion for **render** (FFmpeg pre-decodes all
input video) or for **preview** (auto-proxy transcodes and caches an H.264
copy on first use, disable with `"proxy": false` or `media.autoProxy: false` in
hyperframes.json). A manual H.264 proxy via `ffmpeg -i in.mp4 -c:v libx264
-crf 18 proxy.mp4` remains available for edge cases (e.g. auto-proxy disabled,
or ffmpeg unavailable at preview time).
