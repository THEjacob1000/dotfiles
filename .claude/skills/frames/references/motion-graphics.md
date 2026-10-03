<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/motion-graphics/SKILL.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->


Figma import is unavailable in Numen. Use user-exported local assets and supplied brand values; route by the requested deliverable.

# frames references/motion-graphics.md - dispatch entry

> **The front door is `/frames`.** This skill makes a **short, design-led, unnarrated motion graphic** (motion is the message; ~under 10s, no voice-over). Anything longer, narrated, or multi-scene - or any uncertainty → read `/frames` first: the intent layer owns every route decision.

This workflow is **autonomous by design** - at most one clarifying question (`motion-graphics/agents/director.md`), then build through verification without intermediate review. The intent layer (`/frames` → `intent-interview.md`) routes here directly without run-shape questions; a storyboard and companion session add little to a piece this short. Rendering is still user-gated: after checks and proof snapshots pass, ask the canonical “preview first, or render?” question from `brief-contract.md`. When a `BRIEF.md` exists, read it before the director's question.

A short design-led motion graphic. **Asset-first**: decide the asset strategy and source real material _before_ designing the shot, then design the shot around what you have, then compose by reusing catalog capabilities. All artifacts go to `PROJECT_DIR = videos/<project-name>/` (created in Step 0); all paths below are relative to it.

| Phase    | Execution                                                             | Primary artifact                                                 | Detailed flow                 |
| -------- | --------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------- |
| init     | `frames.init` tool                                                  | `hyperframes.json`                                               | Step 0                        |
| plan     | subagent - **decide search?** + classify + asset strategy             | `shot-plan.json` (draft: category, `asset_needs` queries, brief) | `motion-graphics/agents/director.md` (Part 1) |
| source ◇ | manual frames references/media-use.md procedure (skip if `asset_needs` is empty) | `assets/` + `assets/index.md`                                    | `motion-graphics/phases/source/guide.md`      |
| design   | subagent - shot design around resolved assets                         | `shot-plan.json` (final: block(s) + layout + motion + positions) | `motion-graphics/agents/director.md` (Part 2) |
| build    | subagent - reuse-first composition                                    | `compositions/index.html`                                        | `motion-graphics/agents/builder.md`           |
| verify   | `frames.lint`, `frames.check`, proof snapshots; repair on failure   | `snapshots/contact-sheet.jpg`                                    | Step 5                        |
| approve  | Ask preview or render; wait for the answer                           | explicit render approval                                         | Step 6                        |
| render   | `frames.render` (MP4, or `format: webm`/`mov` for overlay)           | `renders/video.mp4` or transparent overlay                       | Step 6                        |

`◇ source` runs only when the chosen category declares assets. Pure code/text motion-graphics/categories (e.g. `kinetic-type`, most `charts`/`stat`) have `asset_needs: []` and skip straight from plan to design.

## Categories - split by the search decision

`plan`'s **first decision is: does this need a search?** That fork splits the motion-graphics/categories into two groups; then the specific category is picked - for search-driven, **by the type of content the search returns**. Each category is one `motion-graphics/categories/<id>/module.md` (its planning + build rules); the shared motion vocabulary lives in `motion-graphics/references/motion-vocabulary.md` (→ `frames references/animation.md` rules/blueprints + registry blocks).

**Form motion-graphics/categories - no search; the user supplies the content:**

| Category       | Intent                                                                                                         | Leans on                                                                    |
| -------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `kinetic-type` | punchy line / quote / title, motion-first text                                                                 | `caption-*` blocks + animation rules                                        |
| `stat`         | single hero number / count-up + ring                                                                           | `apple-money-count` / `rules/{counting-dynamic-scale, stat-bars-and-fills}` |
| `charts`       | bar / line / pie / race / % from data                                                                          | `data-chart` block                                                          |
| `logo-reveal`  | logo sting / brand lockup (user logo)                                                                          | `logo-outro` / `rules/svg-path-draw`                                        |
| `lower-thirds` | name / title bars, callouts, social overlays                                                                   | `caption-*` + registry overlay blocks                                       |
| `maps`         | geographic motion - highlight regions, connect places, zoom to a location (vector lane, or baked basemap lane) | `us-map` / `world-map` family + manual basemap workflow in `motion-graphics/categories/maps/module.md` |

**Search-driven motion-graphics/categories - search first, then animate by content type** (the RWA path):

| Returned content | Category       | Animation                                                      |
| ---------------- | -------------- | -------------------------------------------------------------- |
| webpage / link   | `webpage`      | webpage / UI animation (scroll, reveal, cursor, callouts)      |
| news article     | `news`         | headline reveal + source card + key-fact callouts              |
| tweet            | `tweet`        | animated tweet card                                            |
| image / entity   | `asset-fusion` | the asset's geometry _becomes_ the chart (RWA diegetic fusion) |

Build order: one at a time, coverage-first (rough is fine). `kinetic-type` ported from the prototype; the rest follow.

## Prerequisites

macOS Apple Silicon or Linux x64. Node.js and ffmpeg are system prerequisites. Use `frames.doctor {}` once. On macOS, GPU rendering may use `PRODUCER_BROWSER_GPU_MODE=hardware`.

Upstream's optional provider keys are not used: asset search and image generation through frames references/media-use.md `resolve` are not available in Numen, so motion-graphics/categories that need sourced assets use what the user supplies or degrade to asset-free.


## Flow

### Step 0 - Initialize

The agent workspace is the repository root. Store artifacts under `PROJECT_DIR = videos/<project-name>/`. Use the directory the user supplied, or a short kebab-case name from the intent (`<subject>-motion`); do not use the workspace basename or a timestamp.

Only initialize when `$PROJECT_DIR/hyperframes.json` is absent: `frames.init {"project": "/absolute/path/to/project", "example": "blank", "skill": "frames references/motion-graphics.md"}`. `frames.init` creates the project; it does not update the installed skills.

Never initialize in the workspace root or nest another `hyperframes/` inside `PROJECT_DIR`. Include `project: <PROJECT_DIR>` in project-scoped tool calls.

### Step 1 - Plan (subagent: Director Part 1)

Before planning any code or technical topic from a repository, ground it. For every symbol, file, or behaviour shown on screen, write a lesson spec whose steps carry `code_refs` (`{"path": "<file relative to the workspace root>", "item_path": "<module, type or method path>"}`) and pass it to `frames.init` with the authored lesson object as `spec` and the absolute repository path as `workspace_root`. The lesson tool resolves each ref against the workspace and fails on any it cannot ground; show code and describe behaviour only from the grounded source it returns. Fix or drop a ref that fails rather than relying on memory.

Dispatch one subagent. Its prompt is the full `motion-graphics/agents/director.md` plus dispatch context (`SKILL_DIR`, `PROJECT_DIR`, the user's request, and schema path `motion-graphics/references/shot-plan-ir.md`). It decides whether the piece requires a search, classifies it, writes `shot-plan.json`, and returns. Validate that the file exists and is non-empty before continuing.

### Step 2 - Source (conditional)

If `shot-plan.json.asset_needs` is non-empty, follow the available sourcing procedure in `motion-graphics/phases/source/guide.md` and `/frames → motion-graphics/references/media-use.md`. Freeze selected assets under `assets/` and write `assets/index.md` with each role, frozen path, and provenance. If no search/provider capability is available, record the unmet need in `context.log` and use the documented asset-free fallback only where the category allows it. There is no Numen asset-resolve tool. If `asset_needs` is empty, skip to Step 3.

### Step 3 - Design (subagent: Director Part 2)

Dispatch a subagent (prompt = `motion-graphics/agents/director.md` Part 2 + dispatch context including the resolved `assets/index.md` if Step 2 ran + `motion-graphics/catalog-map.md`). It designs the shot **around the available assets**: pick the catalog block(s) + the `frames references/animation.md` rules/blueprints, the layout, the motion, beats, and (for `asset-fusion`) the `element_positions` + eyedropper palette. Finalizes `shot-plan.json` (`content.block` + `content.customize` + per-category content).

### Step 4 - Build (subagent: Builder, reuse-first)

Dispatch a subagent with `motion-graphics/agents/builder.md` and context (`shot-plan.json`, `motion-graphics/catalog-map.md`, the category's `module.md`, `motion-graphics/references/motion-vocabulary.md`, `motion-graphics/references/builder-contract.md`). **Reuse-first**: `frames.add {"project": "/absolute/path/to/project", "name": "<block>"}` and customize in place; hand-author only gaps and the asset-fusion affordance. Output `compositions/index.html` honoring the HF contract (paused GSAP timeline on `window.__timelines`, `class="clip"` + stable ids, `tl.seek(0)`, deterministic).

### Step 5 - Verify (frames tools → repair subagent on failure)

Use `frames.lint {"project": "/absolute/path/to/project"}`, `frames.check {"project": "/absolute/path/to/project"}`, then `frames.snapshot {"project": "/absolute/path/to/project", "at": [0.5, 1.5, 3.0]}`.

Choose proof times that show the opening state, signature move, and final hold. Inspect the generated contact or snapshot sheet before continuing. On `lint`, `check`, or snapshot failure, dispatch the repair subagent (`motion-graphics/agents/finalize.md`) for one in-place fix pass, then rerun the failed gate. Never change a fixed duration merely to hide a defect.

### Step 6 - Approve and render

Ask one question: “preview first, or render?” If the user chooses preview, run `frames.preview {"project": "/absolute/path/to/project"}` and return to the same approval gate after revisions.

Render only after an explicit render answer: `frames.render {"project": "/absolute/path/to/project", "quality": "high", "output": "./renders/video.mp4", "format": "webm"}` for a transparent overlay, or use `"format": "mov"` as appropriate. Omit `format` for the default MP4.

Verify the output exists, is non-empty, and has the intended duration. The final handoff names the artifact, actual duration, composition or frame id, proof times, and the inspected contact or snapshot sheet.

## Resume table

| State                                                    | Continue from              |
| -------------------------------------------------------- | -------------------------- |
| no `shot-plan.json`                                      | Step 1 (plan)              |
| `shot-plan.json` has `asset_needs`, no `assets/`         | Step 2 (source)            |
| `shot-plan.json` final, no `compositions/index.html`     | Step 3/4 (design+build)    |
| `compositions/index.html` exists, proof snapshots absent | Step 5 (verify)            |
| checks and proof snapshots pass, no approved render      | Step 6 (approval)          |
| approved render exists                                   | verify output, then report |

## Design notes (maintainers - execution does not read this)

- **Asset-first rationale:** sourcing is front-loaded and informs shot design (the RWA flow: analyze → search → review → compose). the search-driven motion-graphics/categories (`webpage`/`news`/`tweet`) and `asset-fusion` both lean on frames references/media-use.md search (news/web/tweet/image), which is frames references/media-use.md's documented RWA lineage.
- **Reuse-first:** the in-ecosystem analog of LLM-generated templates is "compose catalog blocks + `frames references/animation.md` rules". HF's paused GSAP timeline ≙ Remotion's `useCurrentFrame`.
- **Category module contract:** one `motion-graphics/categories/<id>/module.md` (planning + build), sharing `motion-graphics/references/motion-vocabulary.md` (+ optional eval). Adding a category = drop the folder + register its classifier line in `motion-graphics/agents/director.md` + its row in `motion-graphics/catalog-map.md`; the phase pipeline is untouched.
- **Directory shape:**
  ```
  videos/<project-name>/
    hyperframes.json  context.log
    shot-plan.json            # the IR (Director output)
    assets/  assets/index.md  # frames references/media-use.md output (if sourced)
    compositions/index.html   # Builder output
    renders/video.mp4
  ```
- **Registration:** in `hyperframes` router - add the "design-led short motion graphic" intent + Workflow description; carve the frames references/motion-graphics.md triggers out of `/frames → motion-graphics/references/general-video.md`; add reverse Do-NOT-use edges. See `motion-graphics-genre.md` §5-7.
