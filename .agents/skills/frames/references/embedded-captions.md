<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/embedded-captions/SKILL.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->


Use the merged frames reference guides directly; no plugin installation or refresh
command is part of this workflow.

# Embedded Captions

**One catalog, picked up front** ([embedded-captions/CATALOG.md](embedded-captions/CATALOG.md) - 35 identities; the engines behind it are backend detail). **Standard** (default) builds a clean verbatim **rail** (lower-third subtitle carrying most text) + a designed **embed** climax. **Cinematic** is pure embed - no rail, every caption is composed behind the subject when supplied matte frames are available. Numen does not generate those mattes. **Theme** is a complete themed constitution - body paradigm × hero setpiece × front fx × plate reaction, composed from registries ([embedded-captions/themes/README.md](embedded-captions/themes/README.md)): `ordnance` `terminal` `neonsign` `stardust` `stomp`. Most explainer / voiceover is **Standard**; **embed is the scarce, earned peak** - embedding every word is a mistake.

---

## Runtime prerequisites

Automatic background matting is unavailable in Numen. Do not install or promise an ML matting model, or substitute another matting implementation. `frames.caption_render` requires user-supplied transparent PNG matte frames in `<project>/frames_fg/`, including for foreground captions. Without them, source samples can guide authoring and HTML preview, but final compositing is blocked; request mattes before promising a rendered output.

The local visual-authoring workflow does not require project-side helper dependencies. Use Numen's `frames.*` tools for transcription, caption compilation, preview, compositing and checks. `frames.caption_safe_zones` heuristically analyzes supplied matte frames; it does not create mattes. FFmpeg/ffprobe may be used for inspecting source video and sampling frames.

## Operational flow (TL;DR)

Routed through `/frames`, the intent layer confirms only the input (which clip) and **announces** the identity pick as a deferred ask - the shortlist needs the probed clip, so it stays at step 1 below; the layer's run-shape questions don't apply (the footage is untouched, there is no storyboard to review). A `BRIEF.md`, when present, carries the confirmed input and any user notes - read it first.

The craft prose below is long; the **pipeline itself is short** - and everything deterministic is computed or compiled, never hand-written:

1. **Decision gate** (refuse bad clips) → **pick ONE identity from [embedded-captions/CATALOG.md](embedded-captions/CATALOG.md)** (35 identities; engine/compiler derived by lookup - never surface a mode/category question)
2. `frames.init` (when a new project is needed) → `frames.transcribe` → inspect sampled frames and transcript. If supplied `frames_fg/` mattes exist, run `frames.caption_safe_zones`.
3. **Author a small JSON of creative choices** (read `safe-zones.json` when available): Cinematic → `cinematic.json` → `frames.caption_cinematic`; Theme → `theme.json` → `frames.caption_theme`; Standard → `plan.json` → `frames.caption_fill_timings` → `frames.caption_composition`.
4. **Visual QA**: `frames.caption_preview` → inspect the contact sheet. Run `frames.caption_check` gates and apply § Visual QA before rendering.
5. `frames.caption_render` composites caption layers with the plate and supplied `<project>/frames_fg/` mattes. These mattes are required; Numen cannot produce them. Review caption gates and the final output.

Load-bearing rules people miss:

- **rail (default) + embed (promotion).** `drop` (filler, not shown) / `rail` (verbatim lower-third subtitle, in front, carries most text) / `embed` (a peak word composited behind the subject). **Standard mode does both**, embedding only the peak(s). See **§ Caption model**.
- **The video is delivered UNTOUCHED (Standard/Cinematic; **Theme mode's PLATE budget is the one sanctioned exception** - register-gated reaction beats (charge-dim, punch, shake, grain) defined per theme DNA and applied AFTER the matte composite so subject+text+plate move as one frame)** - captions are the only thing added; the matte just lets the subject occlude the embed track. Never grade/recolor/scanline the footage.
- Two rulebooks: **rail → [embedded-captions/references/rail.md](embedded-captions/references/rail.md)** (thin), **embed craft → [embedded-captions/references/composition-craft.md](embedded-captions/references/composition-craft.md)** (rich, embed-only). Skim by need.

---

## Caption model - rail + embed

Every spoken phrase is one of three things:

|           | What                                             | How it's shown                                                                                                                                                    |
| --------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **drop**  | filler - um/uh, stutters, self-corrections       | not shown                                                                                                                                                         |
| **rail**  | the default - ordinary spoken content (verbatim) | clean lower-third subtitle, **in front**, readable. A punch word can get an inline `emphasis` highlight (accent colour / active-word pop) - it stays on the rail. |
| **embed** | a promoted peak - the headline beat              | one big word composited **behind the subject** (matte occlusion), designed entrance + exit                                                                        |

**The rail carries most of the text; embed is the scarce, earned peak.** Scarcity is **per beat/block, not per clip**: ≤1 hero per block (thought), never two co-visible, ≥ a beat of air between hero windows (the compiler warns under 0.6s). A short clip → usually 1–2; a long explainer → ~one per section. Among multiple heroes, the **largest authored one is the APEX** (it alone gets the full lockup embed + width-fit raise); smaller ones are **MINOR peaks** that ride their column as oversized emphasis lines (fg, damped motion) - not every beat needs the matte showcase, which is exactly what keeps the apex an event. Embedding every word is still the common mistake.

Rail-surface identities build exactly this (rail = `rail.html`, embed = the climax in `index.html`). Column-flow identities drop the rail and make everything embed-style - recommend them only for mood-over-verbatim asks, never for explainer / voiceover where the words must read (embedded-captions/CATALOG.md encodes this per identity).

---

## Step 0 - pick ONE identity from the CATALOG

**One front-end, three engines behind.** The user picks an IDENTITY from [embedded-captions/CATALOG.md](embedded-captions/CATALOG.md) (35 entries: 10 classic + 25 themed); the engine, compiler and authoring file are derived by lookup from the catalog row. **Never surface "Standard vs Cinematic vs Theme" as a question** - those are backend names (a product has one UX even with several engines). The catalog encodes everything routing needs: reading surface, voice, recommend-for, scene needs, adjacency notes for the genuinely-close pairs (loud↔ordnance, neon↔neonsign, cream↔stardust).

The identity pick is a **preference gate** (`brief-contract.md` § 1): in autonomous mode ("surprise me" / "decide for me"), pick from your shortlist yourself and state the one-line why instead of asking.

Procedure: probe the clip → shortlist 2–3 identities from the catalog → recommend ONE with a one-line why → **the user picks** (autonomous mode: you pick, stating the why) → author that identity's file. Identities are engine-locked (no cross combos; opening one is a validation event - see embedded-captions/dna/README.md).

**Always present your recommendation and let the user pick before you author.** Don't silently default.

(The full identity table lives in [embedded-captions/CATALOG.md](embedded-captions/CATALOG.md) - single source of truth for routing. The engine docs below describe each backend's authoring contract.)

**embedded-captions/CATALOG.md is the whole answer space here: this workflow does not search the upstream component registry.** The composition workflows run `frames.catalog` before authoring a named look; this one must not. A registry item - the `caption-*` blocks included - has nothing to mount into. A registry block styles text on a designed canvas; this skill describes captions applied to somebody's footage. When no identity fits the ask, say so and pick the nearest, rather than reaching outside the catalog. Numen provides native caption compilers, but not automatic background matting.

**Recommendation heuristic**: use the "Shortlisting heuristics" in [embedded-captions/CATALOG.md](embedded-captions/CATALOG.md) - they are identity-level (e.g. "炸" shortlists ordnance/stomp/terminal/loud and picks by WHAT should explode), never category-level. Unsure → `anchor`.

- **Cinematic** → author `cinematic.json`, then call `frames.caption_cinematic {"project": "/absolute/path/to/project"}` to generate `plan.json` and composition HTML.
- **Theme** → read [embedded-captions/themes/README.md](embedded-captions/themes/README.md), author `theme.json`, then call `frames.caption_theme {"project": "/absolute/path/to/project"}`.

---

## Decision gate - RUN FIRST

Probe the video and classify the scene before either mode.

```bash
ffprobe <video.mp4>                    # specs
ffmpeg -ss <t> -i <video.mp4> -vframes 1 sample.png   # at 20/50/80%
```

Read the samples. Refuse if:

- Multiple speakers / hard cuts (split & render each shot, or refuse)
- No human subject (this skill is for talking-head)
- Under 3 seconds, **no speech**, or face never clearly visible. Treat near-silent audio with suspicion: transcription may hallucinate words like "Thank you." **Heed that risk and refuse** rather than caption fabricated words.
- **Source already has burned-in captions / subtitles / heavy text graphics** - adding a second caption system conflicts and the footage ships untouched (no covering/inpainting). Burned text often appears only mid-clip: sample a **1fps contact sheet** (`ffmpeg -i in.mp4 -vf "fps=1,scale=160:-1,tile=10x5" sheet.png`), don't trust 3 spot frames.
- **Transcript is garbage** - non-native/heavy-accent speech can transcribe into confident gibberish. Sanity-read `transcript.json` before authoring; if it doesn't parse as language, retry transcription with an available higher-quality setting if supported, else refuse (a verbatim rail of fabricated words is worse than no captions).
- Fast-motion footage can still be captioned, but subject occlusion requires suitable supplied matte frames; Numen does not generate them.

### Pre-flight probes (cost nothing, prevent the worst failures)

1. **Shot-cut probe.** Sample frames at 20%, 50%, 80%. If a different subject/scene appears, **trim the clip** before the cut.
2. **Letterbox / pillarbox probe.** Black bars on the first frame? Compute safe content rect and constrain caption placement inside it.
3. **Luminance probe.** Sample the caption region's average luminance - `under 60` → light text reads as-is, `60-180` → add the glyph scrim, `180+` → opaque text + scrim (never bare light text). **Cinematic templates are cream+`screen` and LOCKED** - use this probe to _pick a fitting identity_ (bright scenes → `ink`, or the opaque-rail `anchor` theme), never to recolour one.
4. **Identity recommendation by tone (you recommend; the user picks - see Step 0 + embedded-captions/CATALOG.md).** explainer / interview / must-read words → rail/panel-surface identities; poetic / social / "cinematic" → column-flow identities by register; "炸 / 特效 / VFX" / named worlds → themed identities. When unsure → `anchor` (words read, scene safe) - but present a shortlist and let the user choose.

---

## Pipeline - 5 steps

1. `frames.init {"project": "/absolute/path/to/project", "video": "/absolute/path/to/clip.mp4", "skill": "frames references/embedded-captions.md"}`
2. `frames.transcribe {"project": "/absolute/path/to/project"}` → inspect `<project>/transcript.json` and sample the source video. If supplied `<project>/frames_fg/` mattes exist, run `frames.caption_safe_zones {"project": "/absolute/path/to/project"}` and inspect `safe-zones.json`. This is heuristic analysis, not automatic matting.
3. [AGENT STEP - authoring] author creative choices, then compile:
   Cinematic: `cinematic.json` → `frames.caption_cinematic {"project": "/absolute/path/to/project"}`.
   Theme: `theme.json` → `frames.caption_theme {"project": "/absolute/path/to/project"}`.
   Standard: `plan.json` → `frames.caption_fill_timings {"project": "/absolute/path/to/project"}` → `frames.caption_composition {"project": "/absolute/path/to/project"}`.
4. `frames.caption_preview {"project": "/absolute/path/to/project"}` → inspect the contact sheet for Visual QA. Run `frames.caption_check {"project": "/absolute/path/to/project", "checks": ["timing", "rail_climax", "overflow", "occlusion", "measure_layout"]}` for caption-specific gates and measured layout; occlusion requires supplied matte frames.
5. `frames.caption_render {"project": "/absolute/path/to/project"}` (Theme: add `"theme": true`) requires user-supplied matte frames in `<project>/frames_fg/`, even for foreground captions. Numen cannot create mattes. If none were supplied, stop before this compositor and request them; do not promise a final composite.

Step 3 differs by mode:

### Step 3 - Cinematic mode (pure embed)

1. **Read `safe-zones.json` when supplied matte frames permit analysis.** Run `frames.caption_safe_zones {"project": "/absolute/path/to/project"}` first; optional `in` / `out` seconds limit the analyzed window. Source samples can guide a foreground layout, but `frames.caption_render` still requires supplied `<project>/frames_fg/` mattes; without them, authoring and HTML preview are not final compositing.
2. **The DNA is the identity you picked in Step 0** (embedded-captions/CATALOG.md) - do not re-open the choice here. Sanity-check it against the scene (bright hero band luma > 150 wants `ink`; full pick guidance lives in the catalog, covering all ten incl. neon / glitch / chrome / velocity). The compiler applies the DNA's type, palette, blend and motion rules, using available scene data.
3. **Author `<project>/cinematic.json`** - `"dna": "<name>"` + thought-BLOCKS, not raw groups: each block = lines of words (grouped 2–5 at clause boundaries) + the plane it stacks in + per-line `css` (size/weight/style only - no positions) + at most ONE line marked `"hero": true` (the promoted word; `"text"` for display form). Optional fields include `template`, `width`, `height`, `fps`, `planes` (named regions as CSS strings or `{ "css": "..." }`), `blocks` (each with `plane` and ordered `lines`, each line with `words`, optional `css`, `hero`, `text`, or `layer`), and `tones`. Words must match `transcript.json` verbatim and in spoken order; at most one hero line.
4. Run `frames.caption_cinematic {"project": "/absolute/path/to/project"}` to lower the blocks to `plan.json` and composition HTML with transcript-derived timing, layering, accumulation and layout. For an independently authored Standard plan, use `frames.caption_fill_timings` before `frames.caption_composition`; use `frames.caption_fit_fonts` to fit authored word geometry. Inspect generated outputs and run the caption gates rather than hand-copying timings.

### Step 3 - Theme mode (themed constitution)

**Read [embedded-captions/themes/README.md](embedded-captions/themes/README.md) FIRST** - paradigm/setpiece registries, linkages, hard rules, and the exact `theme.json` schema.

1. **Pick a theme DNA** by content register (each `embedded-captions/themes/<name>.json` has `voice` + `when`). State your pick + why; the user decides.
2. **Author `<project>/theme.json`** - `embedded-captions/dna`, `lines` (verbatim, transcript order; 1–5 words each - for `takeover` each line is one CARD), `minors` (emphasis words), `hero:{match}` (the climax word/phrase; leave it OUT of `lines` for embed setpieces, keep it IN for inline setpieces and panel+redact). Keep the input contract's optional `text`, `width`, `height`, and `fps` fields when needed.
3. Run `frames.caption_theme {"project": "/absolute/path/to/project"}` to generate `<project>/index.html`, foreground body HTML when required, and the registered plate-reaction data. Preview with `frames.caption_preview`, then use `frames.caption_render {"project": "/absolute/path/to/project", "theme": true}` for the plate/matte/caption composite and theme reactions in `final_fx.mp4`.

---

## Visual QA - preview BEFORE you render

`frames.caption_preview {"project": "/absolute/path/to/project"}` captures representative caption/climax windows and builds a contact sheet. Inspect the returned sheet before rendering; `frames.snapshot` remains available for individual frames. A full render costs minutes - never use it to _discover_ layout problems.

Check the previews (`<project>/preview/sheet.png`) against this list - these are the failures the geometric gates **cannot** catch:

1. **Washout** - light text over a bright region (window/sign/sky): unreadable → move the plane or change DNA/mode (bright scene → `ink`).
2. **Text-on-text** - captions over the scene's own text/graphics, or two caption groups colliding.
3. **Reading order** - on-screen vertical order must match spoken order; the hero must not sit below later words.
4. **Hero presence** - the climax should be BIG and visibly behind the subject (~30–55% occluded), not a floating label in a margin.
5. **Balance** - one coherent column/band, not scattered fragments; margins breathing; nothing clipped.

Then the **5 positive checks** in [embedded-captions/references/reference-bar.md](embedded-captions/references/reference-bar.md) (poster test · timid test · one-glance hierarchy · scene handshake · dead-air audit) - the failure list keeps a render from being broken; the positive list is what makes it _designed_. Ship when both pass.

**Fresh-eyes review (recommended for anything user-facing):** you have confirmation bias about your own layout. If you can spawn a subagent, give it ONLY the preview sheet + this checklist and ask for PASS/FIX verdicts per frame ("review these caption previews against the 5-point checklist; answer PASS or the specific fix per frame"). Apply fixes in plan.json / theme.json, recompile, re-preview - each loop costs seconds. Render once, when the previews pass.

---

## The DNA registry - ten visual languages (replaces the template catalog)

Both embedded-captions/modes draw from **[embedded-captions/dna/](embedded-captions/dna/README.md)** - ten art-directed visual languages that **parameterize per scene** (accent sampled from the footage, contact shadow along the measured light direction, depth-match blur, RMS-coupled hero amplitude):

| DNA             | Register       | Scene fit                                       | Voice                                                                                              |
| --------------- | -------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **cream**       | premium-warm   | dark/mid warm scenes                            | Inter + warm cream + screen; glowing emergence hero (successor of cinematic-cream)                 |
| **ink**         | premium        | **bright scenes (luma > 150)**                  | near-black multiply - type printed ON the wall; the bright-scene answer                            |
| **editorial**   | editorial-luxe | introspective / fashion / poetic                | Bodoni Moda, lowercase-italic hero - magazine elegance                                             |
| **keynote**     | tech-premium   | product / launch                                | opaque white Inter 800, dead-center stillness                                                      |
| **documentary** | formal         | interview / serious                             | burn-in reveals, no hero - gravitas IS the style                                                   |
| **loud**        | loud           | hype / sport / social                           | Anton + scene-sampled accent, single-unit slam + ripple; body ANNOUNCES in front (`bodyLayer: fg`) |
| **neon**        | loud-neon      | neon-noir / nightlife / tech-noir (dark scenes) | electric-cyan signage, ignition flicker, the hero powers ON like a sign                            |
| **glitch**      | loud-neon      | digital / hacker / AI                           | RGB-split echoes snap together on landing; machine-percussive timing                               |
| **chrome**      | loud-luxe      | Y2K / fashion-tech / music                      | liquid-metal gradient hero + one sheen sweep during the hold                                       |
| **velocity**    | loud-sport     | sport / auto / fitness                          | every word arrives along its motion vector (streak+skew), hero passes with speed trails            |

Pick by `safe-zones.json` (`heroAnchor.bandLuma`, `palette.temperature`) × content register - [embedded-captions/dna/README.md](embedded-captions/dna/README.md) has the decision rule. Authoring: `cinematic.json` takes `"dna": "<name>"`.

The engine generates the **hero three-act** from the DNA (no authoring needed): co-visible captions dim (setup) → per-letter entrance with amplitude ∝ spoken loudness (impact) → breathe + glow until exit (afterglow).

(Legacy: `plan.template:"cinematic-cream"` maps to `dna:"cream"` automatically. The retired 54-template library is archived outside this repo and is not distributed with the skill; `_motion.md` remains in-skill as the motion-verb reference catalog.)

---

## Aesthetic decision - tone × shot × platform (input to the catalog shortlist, NOT a second router)

Classify the clip on 3 axes and feed the result into CATALOG.md's shortlisting - this section never picks a mode/engine by itself:

**Tone** (what feel does the content have?)

- documentary | conversational | energetic | poetic | keynote | investigative | music-video

**Shot** (what's the framing?)

- close-up (head + shoulders) | mid-shot (torso+) | wide (full body+) | cut-montage (mixed shots)

**Platform** (where will it play?)

- 9:16 portrait (TikTok/IG/Shorts) | 16:9 landscape (YouTube/web) | 1:1 square | broadcast export

Cross-reference in [embedded-captions/references/direction-catalog.md § Classification matrix](embedded-captions/references/direction-catalog.md) for direction language - then return to [embedded-captions/CATALOG.md](embedded-captions/CATALOG.md) to shortlist identities (this matrix informs the shortlist; the catalog is the only routing surface).

## Composition craft (embed track) - read before embedding

The full **embed-track** playbook lives in **[embedded-captions/references/composition-craft.md](embedded-captions/references/composition-craft.md)**: transcript role-annotation, phrase grouping, planes & clean-zone anchoring, zone coherence, climax pop & readability, edge-breathing, the occlusion 3-step judgement, and accumulation/persistence. It governs how a _promoted_ phrase sits INTO the scene - read it before authoring any embed (Cinematic `plan.json` or Standard `index.html`). The default **rail** track has its own, much simpler spec → **[embedded-captions/references/rail.md](embedded-captions/references/rail.md)**.

---

## Shared knowledge

| Doc                                                                      | What                                                                                                                               |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| [embedded-captions/references/rail.md](embedded-captions/references/rail.md)                                 | **The rail track** - standard lower-third subtitle spec (the default; carries most text).                                          |
| [embedded-captions/references/composition-craft.md](embedded-captions/references/composition-craft.md)       | **The embed-track playbook** - grouping, planes, climax pop, occlusion judgement, accumulation/persistence. Read before embedding. |
| [embedded-captions/dna/README.md](embedded-captions/dna/README.md)                                           | **The DNA registry** - ten scene-parameterized visual languages; how to pick.                                                      |
| [embedded-captions/references/reference-bar.md](embedded-captions/references/reference-bar.md)               | **The taste bar** - per-register world-class embedded-captions/references + the 5 positive checks.                                                   |
| [embedded-captions/references/aesthetic-principles.md](embedded-captions/references/aesthetic-principles.md) | **The 18 rules.** Beat Veed AI on taste. Read first.                                                                               |
| [embedded-captions/references/motion-vocabulary.md](embedded-captions/references/motion-vocabulary.md)       | 10 named motion primitives + tone→timing lookup                                                                                    |
| [embedded-captions/references/direction-catalog.md](embedded-captions/references/direction-catalog.md)       | 10 ship-ready aesthetics + tone×shot×platform matrix                                                                               |
| [embedded-captions/references/anti-patterns.md](embedded-captions/references/anti-patterns.md)               | Bugs already locked out (CoreML, letter-spacing reflow, etc.)                                                                      |
| [embedded-captions/references/scene-types.md](embedded-captions/references/scene-types.md)                   | When a wall surface is usable (4 conditions)                                                                                       |
| [embedded-captions/references/layout-heuristics.md](embedded-captions/references/layout-heuristics.md)       | Plane positioning, clean-zone selection, crown 3 conditions, pillarbox math                                                        |
| [embedded-captions/references/typography-presets.md](embedded-captions/references/typography-presets.md)     | Font-size × column-width matrix (starting points)                                                                                  |
| [embedded-captions/references/caption-grouping.md](embedded-captions/references/caption-grouping.md)         | Word → group rules (pauses, sentence boundaries)                                                                                   |
| [embedded-captions/references/failure-modes.md](embedded-captions/references/failure-modes.md)               | Long tail of dev gotchas                                                                                                           |
| [embedded-captions/references/bespoke-vs-presets.md](embedded-captions/references/bespoke-vs-presets.md)     | Why presets fail sometimes; clone-and-tweak pattern                                                                                |

**Read the aesthetic principles and direction catalog FIRST.** Everything else is implementation detail.

---

## Non-negotiables

- **Face must never be 100%-covered continuously** - every 0.3s window, face bbox ≥30% uncovered.
- **WCAG contrast** - final render lints; fix palette if it fails.
- **Deterministic** - no `Math.random()`, no `Date.now()`, no `repeat:-1`.
- **Never grade/recolor the video.** The footage ships untouched - captions are the only addition. No full-frame scanlines / duotone / darken / vignette over the a-roll. neon-noir/CRT texture belongs _inside_ a caption element, not over the whole frame.
- **Rail-first for talking-head / explainer.** Don't embed the whole transcript - most text is the rail; embed only peaks. Embedding everything is the default mistake.
- **Embed is scarce + spaced.** ≤1 embed per sentence/beat, never two adjacent or co-visible, ≥ a beat apart, at most one `apex`. climax = per-beat peak, **not** "the single payoff of the entire clip."
- **Automatic matting is unavailable; safe-zone analysis is available for supplied mattes.** `frames.caption_safe_zones {"project": "/absolute/path/to/project"}` reads `frames_fg/` and writes heuristic scene regions to `safe-zones.json`. Inspect mattes for missing props or broken alpha; never claim Numen generated them or installed an ML model.
- **Captions stay on-frame.** Use `frames.caption_check` overflow/layout gates and inspect preview frames for anything geometric checks miss.
- **Each caption ≥ 0.5s on screen** - shorter = unreadable.
- **Word timings must match transcript.json within 80ms** - a caption firing 500ms off-beat destroys the scene illusion. Run the timing gate through `frames.caption_check`; compare the transcript against the spoken beat as well. Never pack multiple transcript words into one entry (e.g. `"FUTURE OF"` or an `IT` + line-break + `ALL` stack with one start/end) - the second word inherits the first's timestamp and fires early. Split them into separate word entries with their own timings, even if you want them on the same visual line (use CSS `white-space` / natural wrap instead of `<br>`).
  Creative display substitutions still need truthful timing: `15%` can match “fifteen percent”, `1/3` can match “one third”, and `2x` can match “two times”. These are deliberate display forms, not permission to assign one timestamp to unrelated packed words.
- **Screen-blend fails on bright backgrounds (>180 luminance).** **Cinematic** templates are cream + `screen` and that DNA is **locked** (the plan can't recolour them) → on a bright backdrop they wash out, so pick `ink` (letterpress built FOR bright surfaces) or the `anchor` theme (opaque rail surface) rather than overriding a look.
- **Don't animate `letter-spacing` or `filter:blur` on word entrance** - inline-block reflow causes line-jumps.
- **CoreML banned for matting** - historical upstream mixed-precision partitioning corrupted face alpha. Numen has no automatic matting backend; supplied matte quality remains a prerequisite, not a tool output.

---

## Dependencies

- Numen provides `frames.transcribe`, `frames.caption_theme`, `frames.caption_cinematic`, `frames.caption_composition`, `frames.caption_fill_timings`, `frames.caption_fit_fonts`, `frames.caption_preview`, `frames.caption_render`, and `frames.caption_check`. Use the `project` key for every project-scoped call. Automatic background matting (`remove-background`) remains unavailable.
- The transcription output is word-level `<project>/transcript.json`; inspect it for accuracy before authoring.
- `frames.caption_theme` returns generator diagnostics in `warnings`, including missing bundled-font warnings. Theme-mode `frames.caption_render` includes these diagnostics in its own `warnings`; inspect them before shipping.
- `frames.caption_check` covers rail climax, timing, occlusion, overflow and layout. Occlusion analysis needs supplied matte frames; qualitative taste checks still require the preview sheet.
- `frames.audio_envelope` extracts deterministic audio energy for sound-coupled motion; `frames.stroke_path` generates Hershey stroke paths for writing setpieces. These are native tools, not project-side script invocations.
- `frames.caption_fonts {"project": "/absolute/path/to/project"}` embeds only used, undeclared font families in `index.html`, `rail.html` and `index_fg.html` by default. It fetches pinned upstream WOFF2 assets, verifies their hashes and caches them; first use requires network access for uncached fonts. Optional `files` selects relative composition filenames. `embedded-captions/assets/fonts/char-widths.json` contains baked metrics matching those faces.
- `frames.caption_fonts {"action": "build_css", "output": "<project>/fonts.css"}` builds CSS for all 44 verified pinned faces using the external font cache. Optional `files_dir` selects a local WOFF2 directory instead. Injection also accepts explicit `"action": "inject"` with the same `project` and optional `files` inputs.
- `frames.audio_envelope {"project": "/absolute/path/to/project"}` reads the source audio and writes its envelope. `frames.caption_preview {"project": "/absolute/path/to/project", "times": [1.0, 2.5]}` optionally chooses exact sample seconds; omitting `times` uses representative hero/group windows or clip quartiles.
- `frames.caption_render` defaults to Standard/Cinematic compositing; set `"theme": true` for Theme compilation and native plate reactions. Optional `caption_layer` is `"bg"` or `"fg"`; precedence is explicit input > server `CAPTION_LAYER_FLAG` > plan > first HTML `data-caption-layer` > `"bg"`. Its `occlusion_skip` and `rail_climax_skip` inputs default false, but server `OCCLUSION_SKIP=1` / `RAIL_CLIMAX_SKIP=1` also skip those gates. Skipping a gate while iterating does not waive the shipping checks.
- `frames.stroke_path {"font_svg": "/absolute/path/to/HersheyScript1.svg", "text": "FUTURE", "target_width_px": 700, "baseline_y": 300, "x0": 100}` returns baked pen paths for a writing setpiece. All five inputs are required; theme writing setpieces bake their own paths during compilation.
- Cinematic defaults are `dna: "cream"`, 1920×1080 and 24fps; Theme defaults are 1280×720 and 24fps, with supplied `matte.fps` taking precedence over authored Theme fps. Decimal and rational fps are supported. Theme capture, compositing and plate reactions share the compiler-reported fps. Set dimensions deliberately for portrait clips rather than relying on landscape defaults.
- `frames.caption_fit_fonts {"project": "/absolute/path/to/project"}` measures loaded-font DOM geometry in the browser and shrinks authored plan groups to fit their available width. It compiles its measurement document internally, so it can run before `frames.caption_composition`. The overflow gate and preview remain required to judge the final composition.
- `frames.caption_check {"project": "/absolute/path/to/project"}` defaults to timing, rail-climax, overflow and occlusion gates. Add `"checks": ["measure_layout"]` to inspect layout geometry, or choose any subset using `timing`, `rail_climax`, `overflow`, `occlusion`, `measure_layout`. Defaults are `strict: false`, `word_fail: 0.65`, `word_warn: 0.35`, `cap_fail: 0.5`, `remeasure: false`, `html_name: "index.html"` and `times: []`. Use explicit `times` for known problem windows; stricter findings still need the craft judgment described below.
