<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/hyperframes-creative/references/audio-reactive.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# Audio-Reactive Animation

Drive visuals from music, voice, or sound. Any GSAP-animatable property can respond to pre-extracted audio data.

## Audio Data Format

```js
var AUDIO_DATA = {
  fps: 30,
  totalFrames: 900,
  frames: [{ bands: [0.82, 0.45, 0.31, ...] }, ...]
};
```

- `frames[i].bands[]` — frequency band amplitudes, 0-1. Index 0 = bass, higher = treble.
- Each band normalized independently across the full track.

## Mapping Audio to Visuals

| Audio signal           | Visual property                   | Effect                     |
| ---------------------- | --------------------------------- | -------------------------- |
| Bass (bands[0])        | `scale`                           | Pulse on beat              |
| Treble (bands[12-14])  | `textShadow`, `boxShadow`         | Glow intensity             |
| Overall amplitude      | `opacity`, `y`, `backgroundColor` | Breathe, lift, color shift |
| Mid-range (bands[4-8]) | `borderRadius`, `width`           | Shape morphing             |

Any GSAP-tweenable property works — `clipPath`, `filter`, SVG attributes, CSS custom properties.

## Content, Not Medium

Audio provides **timing and intensity**. The visual vocabulary comes from the narrative.

**Never add:** equalizer bars, spectrum analyzers, waveform displays, musical notes clip art, generic particle systems, rainbow color cycling, strobing white on beats, abstract pulsing orbs.

**Instead:** Let content guide the visual and audio drive its behavior. Bass makes warmth _swell_. Treble sharpens _contrast_. The visual choice comes from "what does this piece feel like?"

## Sampling Pattern

Audio reactivity requires per-frame sampling via a `for` loop with `tl.call()`, not a single tween:

```js
// ✅ Correct — sample every frame
for (var f = 0; f < AUDIO_DATA.totalFrames; f++) {
  tl.call(
    (function (frame) {
      return function () {
        draw(frame);
      };
    })(AUDIO_DATA.frames[f]),
    [],
    f / AUDIO_DATA.fps,
  );
}

// ❌ Wrong — single tween, doesn't react to audio
gsap.to(".el", { scale: 1.2, duration: totalDuration });
```

Without per-frame sampling, the composition doesn't actually react to audio.

## textShadow Gotcha

`textShadow` on a parent container with semi-transparent children (e.g., inactive caption words at `rgba(255,255,255,0.3)`) renders a visible glow rectangle behind all children. Fix: apply `scale` to the container for beat pulse, but apply `textShadow` to individual active words only.

## Guidelines

- **Subtlety for text** — 3-6% scale variation, soft glow. Heavy pulsing makes text unreadable.
- **Go bigger on non-text** — backgrounds and shapes can handle 10-30% swings.
- **Match the energy** — corporate = subtle; music video = dramatic.
- **Deterministic** — pre-extracted data, no Web Audio API, no runtime analysis.

## Constraints

- Pre-extract audio with `frames.audio_data` using `project`, `input`, and optional `output` (default `audio-data.json`), `fps` (default 30), and `bands` (default 16). The tool decodes mono 44.1 kHz signed PCM, computes per-frame RMS and centered 4096-sample Hann FFT peaks across logarithmic 30 Hz–16 kHz bands, and independently peak-normalizes RMS and each band. Output has `duration`, `fps`, `bands`, `totalFrames`, and `frames` containing `time`, `rms`, and `bands`, rounded to four decimals.
- No `Math.random()` or `Date.now()`
- Audio reactivity runs on the same GSAP timeline as everything else
