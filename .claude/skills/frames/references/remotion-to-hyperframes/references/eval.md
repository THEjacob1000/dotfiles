<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/remotion-to-hyperframes/references/eval.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: native analysis tools replace helper scripts. -->
# Eval: how to validate a translation end-to-end

## Per-translation flow

1. Run `frames.remotion_lint {"project": "/absolute/path/to/project", "path": "src", "json": true}`. Findings include file, line, column, severity, rule, message and recommendation. Stop on blockers; document warnings and informational rewrites in `TRANSLATION_NOTES.md`.
2. Stage assets preserving the referenced relative paths.
3. Render a Remotion baseline with the user's source project render command. Node is needed for this baseline, not for the Rust linter or corpus orchestration.
4. Render the translation with `frames.render {"project": "/absolute/path/to/project", "output": "hf.mp4"}`.
5. Run `frames.render_diff {"project": "/absolute/path/to/project", "baseline": "baseline.mp4", "translated": "hf.mp4", "output_dir": "diff", "threshold": 0.95}`. It writes per-frame `ssim.log`, `ffmpeg.stderr`, and `summary.json`.
6. For mismatches run `frames.frame_strip {"project": "/absolute/path/to/project", "baseline": "baseline.mp4", "translated": "hf.mp4", "output_dir": "strip", "samples": 8}`. `strip.png` has baseline on the left and translation on the right at evenly spaced frame indexes in the baseline's 5%–95% window; `timestamps.txt` records seconds.

Both renders need matching pixel format. Set `Config.setVideoImageFormat("png")` and `Config.setColorSpace("bt709")` in the Remotion project's configuration so encoder differences do not dominate SSIM.

## Reading SSIM results

`summary.json` contains `frame_count`, `mean`, `min`, `max`, `p05`, `p95`, `threshold`, and `pass`. Passing uses the unrounded mean against the threshold (default 0.85); reported statistics are rounded to six decimal places. Percentiles use the sorted sample at `floor(p * frame_count)`, capped at the final sample. Identical inputs yield SSIM 1; structural or timing shifts lower it. A failed gate is an observed mismatch, not a setup error. Read failures separately from tool errors.

| Tier | Composition shape | Upstream measured mean | Threshold |
| --- | --- | --- | --- |
| T1 | single-element fade-in | 0.974 | 0.95 |
| T2 | multi-scene + spring + audio + image | 0.985 | 0.95 |
| T3 | data-driven subcomponents and count-up | 0.953 | 0.90 |

These historical measurements are reference points, not claims about a current Numen run. Inspect the generated report and comparison strip, and consult timing, sequencing, or media references for mismatches.

## Automated local corpus

Copy `assets/test-corpus` to a writable local directory, then run `frames.remotion_corpus {"project": "/absolute/path/to/project"}` or select one tier with `"tier":"tier-4-escape-hatch"`. Tiers 1–3 lint sources, install the supplied Remotion fixture dependencies if missing, render the real Remotion baseline, render the supplied HTML through Numen, apply each fixture's SSIM threshold, and produce strips on failed comparisons. T2 setup generates the 200x200 blue PNG and six-second silent mono 8 kHz WAV in both asset trees. T4 checks rule minimum counts, severity floors, and implied blocker exit status against `expected.json`, without rendering or requiring Node/ffmpeg.

`run-report.json` aggregates total, passed, failed, skipped, and per-fixture results. Missing fixtures and unavailable render toolchains are skipped, never successful; failed renders and other execution failures are failures. Aggregate `pass` requires every selected fixture to pass. SSIM failures retain their measured metrics even if strip generation fails; inspect `strip_error` separately. Installed skill assets and the pinned upstream source directory are read-only: copy fixtures to a writable project first. Output directories must be project-relative without parent traversal, and output symlinks cannot escape the project; input videos may use absolute paths.
