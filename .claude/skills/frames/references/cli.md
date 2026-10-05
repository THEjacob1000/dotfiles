<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/hyperframes-cli/SKILL.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->


**Installation:** the frames skill and its references ship with Numen and are projected by `numen sync`; the `frames.*` tools are served by Numen's MCP server. There is nothing to install or update.

# Numen frames tools

Call the `frames.*` tools on Numen's MCP server with the JSON parameters in their schemas. Project-scoped tools require an absolute `project` path; do not assume upstream CLI flags are supported. The tools need FFmpeg and Chrome; `frames.doctor` reports what it found.

## Development loop

1. **Scaffold:** `frames.init {"project": "/absolute/path/to/project"}` (centered blank). Or capture a site with `frames.capture`. Pass `"example": "<name>"` only to start from a named example.
2. **Find the move:** if the request names an asset, sound, image, voice or fast visual edit, resolve it through `/frames → cli/references/media-use.md` before proposing a plan. Otherwise, before authoring motion by hand, search for a primitive that already does it: `frames.catalog {"query": "reveal a headline one line at a time"}`. Ask for the effect you want rather than the mechanism you have in mind. Install with `frames.add {"project": "/absolute/path/to/project", "name": "<name>"}` (see `/frames → cli/references/registry.md`). Author by hand only once nothing fits.
3. **Author:** write the composition using `/frames → cli/references/core.md`. To know what is on a project's timeline (tracks, clips, starts, ends, what plays), run `frames.timeline` instead of reading `index.html` and every sub-composition file: nested rows carry absolute main-timeline `absStart`/`absEnd` and their owning `file`, not just their local, per-sub-composition time. The tool returns the JSON form, which costs fewer tokens than the text form for the same or better correctness. See `cli/references/upgrade-info-misc.md` for one-liners that answer common questions without reading the whole output.
4. **Get fast feedback while editing:** run `frames.lint` after the first HTML pass and after structural changes.
5. **Run the final gate:** run `frames.check`; it reruns lint before opening the browser. Do not prepend a redundant standalone lint invocation. Add `"snapshots": ".hyperframes/check-snapshots"` for annotated overview frames and finding crops.
6. **Inspect sub-compositions:** when `index.html` mounts `data-composition-src`, capture midpoint snapshots and inspect each mounted scene.
7. **Open the final live preview:** run `frames.preview`, verify the returned URL responds with HTTP 200, hand that URL to the user, and ask whether to revise or render. Keep it alive until review ends. Studio editing is unavailable; revise the composition source.
8. **Render only after approval:** use `"quality": "draft"` while iterating, `"quality": "looks"` for the first real encode (the default), and `"quality": "delivery"` for final delivery.
9. **Verify the output:** read the JSON render report's `output`, confirm that file exists and is non-empty, and inspect `frames`, `duration`, `fps`, `has_audio`, `elapsed_ms`, `page_errors` and `console_errors`. Use ffprobe to compare duration and requested fps to the composition. The tool does not report a second summary line or capture-stage timings.

<!-- history (trial): remove this block together with the command -->

### Project history in your turn

Every write to the project is kept as an entry that can be undone. Use it at two moments only, never on every step:

- **Start of a turn:** `frames.history {"project": "/absolute/path/to/project", "action": "begin", "who": "<your-name>", "label": "<what you are about to do>"}`, then `frames.history {"project": "/absolute/path/to/project", "since": "mine", "who": "<your-name>"}` to see what the person changed since your last turn. Build on their edits; never overwrite them.
- **A check failed, or the person says it got worse:** `frames.history {"project": "/absolute/path/to/project", "action": "undo", "who": "<your-name>"}` undoes your newest turn and leaves the person's edits alone. Do not hand-edit back. On conflict, read the error result's `conflict` object and choose `just_this` or `back_to_before` explicitly; there is no CLI exit code.

End each turn with `frames.history {"project": "/absolute/path/to/project", "action": "end"}`, so your writes read as yours, not as "Changed outside the app". While a turn is open, every write to the project counts as yours until 10 minutes pass without one; after that the turn has ended by itself.

<!-- /history (trial) -->

## Mandatory creator-edit cross-references

- Before authoring or diagnosing a zoom, punch-in/punch-out, reframe, camera
  move, or any keyframe motion, read `/frames → cli/references/keyframes.md` first.
- Before `frames.keyframes`, read `/frames → cli/references/keyframes.md`; the command
  surfaces animation trajectories and does not diagnose clip cuts.
- For a cut, trim, splice, reorder, or source timing edit, read
  `/frames → cli/references/core.md` and use its clip/timeline contract.
- For fade-in/fade-out, crossfade, track gain, volume automation, ducking,
  voiceover carve, or FX on placed audio, read `/frames → cli/references/audio.md`. Load core
  alongside it when clip placement or picture timing also changes.
- A request naming an asset, sound, image, voice or fast visual edit resolves through `/frames → cli/references/media-use.md` before a plan is proposed.
  Copy creator edit markup from `/frames → cli/references/core.md` → `core/references/creator-editing-recipes.md`.

```bash
# Fast iteration check; repeat while authoring as needed.
frames.lint {"project": "/absolute/path/to/project"}

# Required final gate; includes lint.
frames.check {"project": "/absolute/path/to/project"}
frames.preview {"project": "/absolute/path/to/project"}
frames.render {"project": "/absolute/path/to/project", "quality": "looks", "output": "out.mp4"}
test -s out.mp4
ffprobe -v error -show_format -show_streams out.mp4
```

`check` runs lint first, then uses one browser session and one seek pass to audit runtime errors, failed requests, layout, `*.motion.json` assertions, and WCAG contrast. Persistent findings gate the exit code; transient entrance or exit findings are informational. Pass `"strict": true` to gate warnings. Upstream's deprecated `validate`, `inspect`, and `layout` aliases all map to `frames.check`.

## Preview before render

Open the final composition with `frames.preview` only after `check` passes, and share the returned live-player URL unchanged. The plan in chat and the `storyboard.html` sketch sheet are not approval of the final video. Rendering always requires the final approval defined by `frames/references/review-loop.md`.

## Sub-composition smoke test

Static audits cannot catch every mount failure. When the project uses sub-compositions, capture at least one visible midpoint for each host slot:

```bash
frames.snapshot {"project": "/absolute/path/to/project", "at": [0.5, 1.5, 3.0]}
```

Treat tiny unstyled content, canvas-sized icons, missing hero elements, or timeline-registration timeouts as render-blocking mount defects. See `frames/references/core/references/sub-compositions.md` for the corresponding fixes.

## Agent conventions

- **Search the catalog before writing motion by hand.** `frames.catalog {"query": "<the beat, in plain English>"}` searches the local catalog's names, titles, descriptions and tags.
- **Query in English even when the video is not.** Describe the move in English; the on-screen copy stays in whatever language the video needs.
- **Read the result envelope and warnings.** Word ranking is the available tier. `on_device` is unavailable: requesting it produces a warning, not an error, and leaves word ranking active. Do not offer a model download or promise semantic search.
- **When a search comes back with nothing worth installing, say so**, naming the query and move needed. Try the catalog's own vocabulary before hand-authoring.

- Tool results are JSON. `frames.preview` and `frames.play` return live-player URLs, not editor selection or context. `frames.present` serves slideshow navigation.
- `frames.doctor` always succeeds. Gate on its payload's `ok` field.
- `frames.init` never prompts and scaffolds the centered blank. Pass `"example"` only to start from a named example.
- When disk is tight, run `frames.clean` (`"dry_run": true` to list first); it removes what dead renders left and idle caches that rebuild themselves, never outputs, sources or anything a running render uses. Write QC frames to a temp dir, not the project.
- Pass `"strict"`, `"strict_all"`, and `"strict_variables"` when the corresponding warnings, variables, or CI conditions must gate the render.
- JSON paths redact the home directory as `$HOME`; do not try to reverse the redaction.
- Never render merely because checks pass. Pause at the final preview and wait for approval.

## Targeted source edits

Studio selection and editing are unavailable. Identify the target from the user's description, `frames.timeline`, source IDs and proof snapshots. If the target is ambiguous, ask which source element or scene they mean before editing.

## Render choices

| Need                                     | Command                                                                       |
| ---------------------------------------- | ----------------------------------------------------------------------------- |
| Fast local iteration                     | `frames.render {"project": "/absolute/path/to/project", "quality": "draft"}`                                      |
| First real encode                        | `frames.render {"project": "/absolute/path/to/project", "quality": "looks", "output": "out.mp4"}`                     |
| Final local delivery                     | `frames.render {"project": "/absolute/path/to/project", "quality": "delivery", "output": "out.mp4"}`                  |
| Local variable-driven batch render       | `frames.render {"project": "/absolute/path/to/project", "batch": "rows.json", "output": "renders/{name}.mp4"}`      |

A project scaffolded by a workflow (`frames.init {"project": "/absolute/path/to/project", "skill": "<workflow>"}`) records its owning skill in `hyperframes.json`. Lesson-mode init (`spec` plus `workspace_root`) rejects `example`, `video`, `audio`, `tailwind` and `resolution`; use those only for standalone scaffolding.

`frames.render` renders locally. When a render fails, give the user a rerunnable tool call, expected versus actual behavior, exact error, outcome and workaround. Redact personal paths before sharing. The packet format lives in `cli/references/preview-render.md`.

## Read the matching reference before running a command

The following cli/references and owning skills are mandatory command contracts, not optional background reading. Before running a command in the table, read its matching row.

| Need                                                                                               | Reference                             |
| -------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `init`, `capture`                                                                      | `cli/references/init-and-scaffold.md`     |
| `lint`, `check`, motion sidecars, `snapshot`                                                       | `cli/references/lint-validate-inspect.md` |
| `compare`, `grade-compare`, variable-driven `render --batch`                                       | `cli/references/compare-and-batch.md`     |
| `beats` for an existing project's beat grid | `cli/references/beats.md` |
| `preview`, `play`, `render`, bug reports | `cli/references/preview-render.md` |
| `doctor`, browser management                                                                       | `cli/references/doctor-browser.md`        |
| `info`, `compositions`, `timeline`, `benchmark`, media preprocessing | `cli/references/upgrade-info-misc.md`     |

For composition variables, also read `/frames → cli/references/core.md` → `core/references/variables-and-media.md`. For `frames.add` and `frames.catalog`, use `/frames → cli/references/registry.md`. Before `frames.present`, read `/frames → cli/references/slideshow.md`; before `frames.lesson` or `frames.lesson_plan`, read `/frames → references/lesson.md`; before `frames.keyframes`, read `/frames → cli/references/keyframes.md`. For TTS, transcription, captions, or background removal choices, use `/frames → cli/references/media-use.md`.

The specialized commands are deliberately documented by their owning workflows:

```bash
frames.present {"project": "/absolute/path/to/project", "port": 3004, "open": false}
frames.lesson {"spec": {"title": "…", "entry": {"type": "topic", "value": "…"}, "size": 1, "steps": […], "prerequisites": []}, "workspace_root": "/absolute/path/to/repo"}
frames.lesson_plan {"workspace_root": "/absolute/path/to/repo", "graph": [{"id": "…", "title": "…", "entry": {"type": "topic", "value": "…"}, "prerequisites": []}]}
frames.beats {"project": "/absolute/path/to/project"}
frames.keyframes {"project": "/absolute/path/to/project"}
frames.media_treatment {"capabilities": true}
```

`present` serves a navigable deck with presenter and audience synchronization. `lesson` serves one grounded, narrated browser lesson and blocks until it ends, returning the learner event log; `lesson_plan` orders a caller-authored lesson dependency graph. `beats` is the project beat-grid utility defined in `cli/references/beats.md`. `keyframes` surfaces seek-safe animation and motion-path diagnostics. `media-treatment` discovers, applies, and clears deterministic looks on local footage; start with `"capabilities": true` for the overview and `"capability": "<name>"` for one family. `/frames → cli/references/media-use.md` owns which treatment a brief is asking for. Figma import is unavailable; use exported local assets.

