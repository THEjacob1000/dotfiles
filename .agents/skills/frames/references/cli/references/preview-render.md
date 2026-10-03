<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/hyperframes-cli/references/preview-render.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# preview, play, render

Local live-player and render tools. Studio editing and selection queries are unavailable.

## preview

```text
frames.preview {"project": "/absolute/path/to/project"}
frames.preview {"project": "/absolute/path/to/project", "port": 4567}
frames.preview {"project": "/absolute/path/to/project", "stop": true}
```

`preview` retains a live player for review. Share its returned URL unchanged, verify HTTP 200 before handoff, and keep the server alive until review ends. Stop only that project's server afterward.

Edit the composition source, not a Studio timeline. Use `frames.timeline`, element IDs and snapshots to resolve an edit target; ask for clarification when the source target is ambiguous.

## play (lightweight player)

```bash
frames.play {"project": "/absolute/path/to/project"}                  # explicit project, port 3003
frames.play {"project": "/absolute/path/to/project"}       # specific project
frames.play {"project": "/absolute/path/to/project", "port": 8080}      # custom port
```

`play` serves the same composition as a live player without editing panels. Share the URL returned by the tool; neither player uses Studio's project-hash routing.

The player's `playback-rate` attribute (preview speed control, drives the timeline's `timeScale`) is clamped to `[0.1, 5]`; values `≤ 0` or non-finite fall back to `1`. This is a preview/playback knob, not a composition `data-*` attribute — authored motion still renders at `1×`.

### Launching with an external browser (preview + play)

Both `preview` and `play` can open an explicit Chromium-compatible browser instead of the OS default. Use an isolated profile or attach external CDP automation to the reported endpoint. `open: true` requests browser launch; these options do not automate edits.

| Flag                      | Type            | Notes                                                                                                                                                                                           |
| ------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--browser-path`          | path            | Absolute path to a Chromium-compatible executable (`/usr/bin/chromium`, `/Applications/Brave Browser.app/...`).                                                                                 |
| `user_data_dir` | absolute path | Isolated Chromium profile. A supplied `browser_path` is optional; otherwise Chrome discovery selects the executable. |
| `remote_debugging_port` | integer 1-65535 | Requires an isolated `user_data_dir`. Do not expose CDP on a normal browsing profile. |

```bash
# Open preview in an isolated Chromium profile
frames.preview {"project": "/absolute/path/to/project", "browser_path": "/usr/bin/chromium", "user_data_dir": "/tmp/hf-profile"}

# Same plus a CDP endpoint on :9222 (attach DevTools / Playwright / etc.)
frames.play {"project": "/absolute/path/to/project", "browser_path": "/usr/bin/chromium", "user_data_dir": "/tmp/hf-profile", "remote_debugging_port": 9222}
```

Validation runs before any server boots, so an invalid value exits cleanly without leaving a listening socket behind.

## render

> Render only after the user has reviewed in `preview` and approved. Don't auto-render when the checks pass.

```bash
frames.render {"project": "/absolute/path/to/project"} # standard MP4
frames.render {"project": "/absolute/path/to/project", "output": "./out.mp4"}  # render from outside the project dir
frames.render {"project": "/absolute/path/to/project", "output": "final.mp4"}             # named output (no timestamp)
frames.render {"project": "/absolute/path/to/project", "composition": "compositions/intro.html", "output": "intro.mp4"}  # render a specific sub-composition file
frames.render {"project": "/absolute/path/to/project", "quality": "draft"}                # fast iteration
frames.render {"project": "/absolute/path/to/project", "quality": "looks"}                # first real encode (default)
frames.render {"project": "/absolute/path/to/project", "fps": 60, "quality": "delivery"}    # final delivery
frames.render {"project": "/absolute/path/to/project", "format": "webm"}                  # transparent WebM
```

Default output names use epoch nanoseconds under `renders/`; batches also include the row index. Read the actual path from the result's `output`, or pass `output` for a stable filename.

| Flag                                 | Options                                                                                            | Default                        | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `project` | absolute path | required | Composition project directory. |
| `--composition`, `-c`                | path to composition file                                                                           | `index.html`                   | Render a specific composition file (e.g. `compositions/intro.html`) instead of the project's `index.html`.                                                                                                                                                                                                                                                                                                                                    |
| `output` | path | generated under `renders/` | Relative destinations resolve beneath the absolute project directory; read the result for the actual path. |
| `--fps`                              | 24, 30, 60                                                                                         | 30                             | 60fps doubles render time                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `--quality`                          | draft, looks, delivery, standard, high                                                             | looks                          | `looks` is CRF 16 on the standard preset. `delivery` is `high`. draft for iterating                                                                                                                                                                                                                                                                                                                                                           |
| `--format`                           | mp4, webm, mov, gif, png-sequence, hls                                                             | mp4                            | WebM/MOV render with transparency; gif for inline autoplay in GitHub PRs/READMEs/docs (two-pass palette encode, fps capped at 30 — prefer `--fps 15` — no audio, 1-bit transparency only, HDR falls back to SDR); png-sequence writes RGBA frames to a directory (AE/Nuke/Fusion ingest); hls writes an HLS VOD directory (master.m3u8 + video/audio playlists + MPEG-TS segments), SDR only, rejects `--gpu`, local output only |
| `--crf`                              | 0-51                                                                                               | —                              | Encoder CRF (lower = higher quality). Mutually exclusive with `--video-bitrate`.                                                                                                                                                                                                                                                                                                                                                              |
| `--hdr`                              | flag                                                                                               | off                            | Force HDR output even with SDR sources. MP4 only.                                                                                                                                                                                                                                                                                                                                                                                             |
| `--workers`                          | number or `auto`                                                                                   | auto                           | Each worker spawns Chrome (~256 MB)                                                                                                                                                                                                                                                                                                                                                                                                           |
| `gpu` | software, auto, nvenc, videotoolbox, vaapi, qsv, amf | software | Encoder selection only; it does not switch browser capture to a hardware or BeginFrame path. |
| `--strict`                           | flag                                                                                               | off                            | Fail on lint errors                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `--strict-all`                       | flag                                                                                               | off                            | Fail on lint errors AND warnings                                                                                                                                                                                                                                                                                                                                                                                                              |
| `--variables`                        | JSON object                                                                                        | —                              | Override values declared in `data-composition-variables`                                                                                                                                                                                                                                                                                                                                                                                      |
| `--variables-file`                   | path                                                                                               | —                              | JSON file with variable values (alternative to `--variables`)                                                                                                                                                                                                                                                                                                                                                                                 |
| `--strict-variables`                 | flag                                                                                               | off                            | Fail render on undeclared keys or type mismatches in `--variables`                                                                                                                                                                                                                                                                                                                                                                            |

**Quality guidance:** `draft` while iterating, `looks` (the default) for the first real encode, `delivery` for final delivery. `standard` and `high` still work.

**Read the JSON render report.** It returns `output`, `frames`, `duration`, `fps`, `width`, `height`, `has_audio`, `elapsed_ms`, `page_errors`, `console_errors` and encoder `gpu` information. Browser capture uses software screenshot capture; no BeginFrame mode, second summary line or capture-stage timings are exposed. Inspect errors and the actual output rather than guessing a capture path.

**Parametrized renders:** the composition declares its variables on the `<html>` root with **`data-composition-variables`** — a JSON **array of declarations** (`{id, type, label, default}` per entry) that defines the schema. Scripts inside read the resolved values via `window.__hyperframes.getVariables()`. The CLI `--variables '{"title":"Q4 Report"}'` is a JSON **object keyed by id** that overrides those declared defaults for one render; missing keys fall through, so the same composition runs unchanged in dev preview and in production. Sub-comp hosts can also override per-instance with `data-variable-values`. See the `frames references/core.md` skill for the full pattern.

### Bug reports (after rendering)

When a render is wrong or needs a workaround, give the user this reproduction packet:

```text
REPRO CALL: <the exact frames.* call and any HF_*/PRODUCER_* env>   # paths relative to the project directory; do NOT paste absolute paths
EXPECTED / ACTUAL: <expected behavior> / <observed behavior and isolated trigger>
EXACT ERROR: <verbatim error or warning; include frame/timestamp for visual defects>
OUTCOME: <output correct | output corrupt | fallback succeeded | hard exit | command hung>
WORKAROUND: <exact workaround, or none>
COMPOSITION_STRUCTURE:
  elements: video=<n> audio=<n> img=<n> svg=<n> canvas=<n> subComps=<n>
  attributes: <comma-joined subset of clip-path, filter, mix-blend-mode, transform, mask, position:fixed, overflow:hidden, z-index, data-has-audio, data-duration, data-start, data-composition-src, background-image:url, mask-image:url — or "(none present)">
  timeline: <flat | nested (<n> sub-comps)>; driver=<gsap | data-timeline | gsap+data-timeline | none>
  delta: <what differs between the working workaround-render and the broken default render>
  defect: <spatial location + frame index range, e.g. top-left / frames 0-30 — omit for non-visual defects>
```

`COMPOSITION_STRUCTURE` records counts and presence flags only, without source URLs or user text. Include it for visual defects so the composition shape can be reproduced without sharing private assets.

Redact absolute paths (which leak the user home directory and machine identity), user or project names embedded in paths, secrets, and credentials before sharing the packet.

