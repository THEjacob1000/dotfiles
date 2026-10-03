<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/media-use/SKILL.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->


# frames references/media-use.md

The media OS for HyperFrames: resolve · generate · operate · remember - every media type, one skill, zero context noise.

Asset search and resolution for BGM, SFX, images, icons, logos, and fonts are not available in Numen. Use assets supplied by the user. HeyGen TTS is also unavailable; local voice generation is available through `frames.tts`. Setup and provider details: `media-use/references/setup-providers.md`.

## Resolve - the one verb

Remote asset search (upstream `resolve`) remains unavailable. Use supplied local assets and `frames.media_index` to persist inventory. Local voice uses `frames.tts`; exact error diffusion uses `frames.dither`; reusable cube generation/validation/ingestion uses `frames.lut`; remembered defaults and approved bundles use `frames.media_prefs` and `frames.media_recipe`.

| Type    | One-line intent                                                                  |
| ------- | -------------------------------------------------------------------------------- |
| `bgm` | user-supplied background music |
| `sfx` | user-supplied local sound effects |
| `image` | user-supplied photos and backgrounds |
| `icon` | user-supplied icons and symbols |
| `logo` | supplied official brand marks; never redrawn |
| `voice` | TTS voiceover (local Numen voice through `frames.tts`)                           |
| `grade` | measured correction candidate; broad polish/stylization follows Media Treatments |
| `lut`   | local parametric generation or supplied validated `.cube` through `frames.lut` |


## Treat broad visual feedback as media intent

When a user explicitly asks to fix, polish, stylize, obscure, emphasize, or
reveal photographic media, read `media-use/references/media-treatments.md` even if they
do not name color grading or an effect. Inspect the real `<img>`/`<video>`,
choose one primary intent, then use deterministic persistence and verification.
Use a matching recipe as an optional tested seed, or inspect
`frames.media_treatment {"capabilities": true}`, then request one relevant
family/effect with `"capability": "<id>"` and assemble a custom treatment from
canonical controls. Never load `"all": true` for ordinary authoring. A treatment may
compose correction, a preset, finishing, compatible shader effects, supported
keyframes, and optional Registry overlays. Add only source-justified bounded
tuning and compatible parts, never effects merely to make the result look more
sophisticated. Persist the final combined payload with
`frames.media_treatment`.

Use one progressively escalating workflow. For video, inspect one labeled
early/middle/late contact sheet rather than reading frames separately. Apply one
candidate and inspect one after-sheet for ordinary correction or polish.
Escalate to individual frames or moving draft evidence only when the result is
ambiguous, temporal, stylized, LUT-based, HDR/LOG-sensitive, private, or
brand-critical.

For ordinary correction or polish, persist the final treatment's
preset/adjustment JSON.
Do not generate a `.cube` LUT merely to encode exposure, shadows, contrast, or
warmth. Use a LUT only when the user supplies one or the selected treatment
explicitly owns one. `frames.media_treatment` analysis is measurement
evidence, not permission to replace the chosen treatment with a generated LUT.
Do not recreate supported vignette, grain, blur, pixelate, color, or treatment
effects with CSS/SVG overlays; that bypasses Studio controls and the canonical
preview/render shader path.

## Be proactive - run a media opportunity pass

The human usually can't tell which media would lift the piece. You can. When you build or review a composition, do **one** grounded scan and then **ask once** - don't silently add, and don't nag per asset.

Surface an opportunity only when a concrete signal is present:

| Signal detected                                          | Offer                                                                                                  |
| On-screen text / a script with no voiceover | Offer local voiceover via `frames.tts` |
| Emoji or a `<div>` styled as an icon | Offer to use a user-supplied icon |
| Image that is a placeholder, tiny, or upscaled-looking | Offer to replace it with a user-supplied image |
| Hard scene cuts / transitions with no sound | Offer to use a user-supplied SFX |
| A piece over ~10s with no music bed | Offer to use user-supplied BGM |
| Footage that reads under/over-exposed or color-cast      | a corrective grade (inspect it with `frames.media_treatment {"selector": "#hero", "analyze": true}`) |
| Photographic media that feels visually flat or off-topic | one specific source-appropriate preset or custom treatment, with the intended target named             |
| A meaningful media entrance/reveal that feels static     | one supported seek-safe treatment animation; preserve color unless the request also justifies a preset |

Rules that keep this a help, not nagware: **grounded, not generic** (no signal → no suggestion); **opinionated + concrete** (propose the specific fix with defaults chosen - the human approves **all / some / none**); **once per project** (one consolidated ask; respect "leave it"); **surface, never silently mutate** (color grades especially: propose and preview - a gray-world "correction" ruins an intentional sunset or neon look).

## Where to look - read only the file your task needs

| Task | Read |
| ---- | ---- |
| User-supplied assets and their placement | `media-use/references/operations.md` |
| Color grading, LUTs, smart grade, grade-compare | `media-use/references/grading.md` |
| Local voiceover / TTS, captions, transcription | `media-use/references/audio.md` |
| Source-aware creative treatments, realtime effects, overlays, reveals | `media-use/references/media-treatments.md` |
| Remembered preferences and frozen recipes | `media-use/references/memory.md` |
