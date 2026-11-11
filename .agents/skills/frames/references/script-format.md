<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/e1925d4317fcd13c0e5799cd4767a3e2dd4c9238/skills/hyperframes/references/script-format.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# `SCRIPT.md` — locked narration (optional)

The **locked narration** for a project: the final spoken lines + voice + delivery. It is an _optional_ plan-layer file — a video with no narration (bgm-only, silent overlay) has none. The storyboard's per-frame `voiceover` is the lighter, editable _guide_; `SCRIPT.md` is the _commit_. (Storyboard format → `references/storyboard-format.md`.)

This file defines the SCRIPT.md **shape** only. Use supplied recordings and [the audio workflow](media-use/references/audio.md) for transcription and measured timing.

Free-form markdown — there is no strict parser; the indented blocks identify spoken lines.

## Shape

A header block, then one section per spoken line.

| Part                            | Holds                                                                                                                                   |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Header                          | `**Voice:**` (speaker or recording identity), `**Voice direction:**` (overall delivery) |
| `## Line N — <label> (Frame N)` | one spoken line, tied to its storyboard frame                                                                                           |
| `**Time:**`                     | the frame's rough window — a guide, not authoritative (real timing comes from transcribing the supplied recording) |
| `**Delivery:**`                 | per-line delivery note                                                                                                                  |
| indented block                  | the **spoken text** |

## Example

```markdown
# SCRIPT — acme-launch

**Voice:** Supplied narrator recording
**Voice direction:** Confident, warm, a little playful.

---

## Line 1 — Hook (Frame 1)

**Time:** 0.0 – 3.0s
**Delivery:** Land the promise on the beat.

    Ship a launch video in an afternoon.

## Line 2 — The problem (Frame 2)

**Time:** 3.0 – 7.0s
**Delivery:** Wry, a touch tired.

    The old way? Prompt, wait twenty minutes, get something that misses.
```

## Recordings and timing

Associate supplied recordings with each line's frame ID. Run `frames.transcribe`
with the recording's language for word timing, then review alignment against
the locked script. Real per-word timing replaces the `**Time:**` guides.
