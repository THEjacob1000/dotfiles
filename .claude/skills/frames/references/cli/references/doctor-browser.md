<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/hyperframes-cli/references/doctor-browser.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# doctor, browser

Environment diagnosis and bundled-Chrome management. Run these first when a render or preview fails.

## doctor

```bash
frames.doctor
```

Runs independent checks and reports each as ok/warn/fail:

- **CPU**, **Memory**, **Disk** — host resources
- **Configuration** — resolved cache and browser locations supplied by the server
- **FFmpeg** / **FFprobe** — found, version, codecs
- **Chrome** — bundled or system, version, path
- **/dev/shm** — inside containers only

Run `doctor` first when:

- `render` fails with a Chrome or FFmpeg error.
- `preview` opens but the composition fails to load.
- A fresh machine has never run HyperFrames.

Common issues:

- **Missing FFmpeg** — install via `brew install ffmpeg` (macOS) or your package manager.
- **Missing bundled Chrome** — run `frames.browser {"action": "ensure"}`.
- **Low memory** — close other Chromes, reduce `"workers"`, or use `"quality": "draft"`.
- **Chrome exits instantly inside an agent sandbox (macOS)** — seatbelt-style sandboxes
  (e.g. codex `workspace-write`) block Chromium's Mach port bootstrap
  (`MachPortRendezvous`; openai/codex#21292), so every Chrome — bundled, system, or
  headless shell — dies at startup. This is a host-level block, not a HyperFrames or
  Chrome install problem: compile checks and audio still pass, only rendering is
  unavailable. State the blocker and deliver the checked composition; render outside the
  sandbox where available. **Do not build a
  substitute rasterizer** (magick/PIL/SVG frame pipelines) — on a blocked-browser host
  the deliverable IS the checked composition plus this blocker note, and rendering is
  handed to the user. Write your final summary the moment the
  blocker is identified, BEFORE any optional fallback work: a later session failure must
  not erase the report of work already done.

## browser

```bash
frames.browser {"action": "ensure"}    # find or download the pinned Chrome
frames.browser {"action": "path"}      # print the browser executable path (for scripting)
frames.browser {"action": "clear"}     # remove the cached Chrome download
```

Manage the Chrome build HyperFrames uses for rendering. The pinned version exists because pixel output drifts across Chrome versions — using the bundled build keeps rendered output reproducible across machines.

Use `path` to get the binary location for other tools.

The MCP server resolves host locations once at startup through `numen-config`
(`HOME`, `XDG_CACHE_HOME`, and `NUMEN_FRAMES_CHROME`, plus platform font
locations and executable search paths). Frames libraries receive those locations
explicitly; changing the process environment after startup does not change a
running service. Rendering, caption gates, transcription model/language, and
timeouts are explicit per-call options, not environment-triggered behavior.
PR fetching is read-only: it uses `gh pr view` and `gh pr diff`, never `jj`.
