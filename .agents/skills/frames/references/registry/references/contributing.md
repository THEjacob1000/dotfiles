<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/hyperframes-registry/references/contributing.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# Contributing a Block or Component to the Registry

Guide the user from idea to merged PR for a new registry block or component.

## Workflow

```
1. Clarify → 2. Scaffold → 3. Build → 4. Validate → 5. Preview → 6. Ship
```

### Step 1: Clarify

Ask what they're building. The registry has two item types:

- **Block** (`registry/blocks/`, type `hyperframes:block`) — a full standalone composition with fixed dimensions and duration. Caption styles, VFX effects, title cards, lower thirds.
- **Component** (`registry/components/`, type `hyperframes:component`) — a reusable snippet with no fixed dimensions or duration. CSS effects, text treatments, overlays that adapt to any composition size.

Then ask:

- One-sentence description of the effect
- Visual reference (URL, screenshot, or description)
- Who uses this and when?

### Step 2: Scaffold

Create the registry structure:

**For blocks:**

```
registry/blocks/{block-name}/
  {block-name}.html
  registry-item.json
```

**For components:**

```
registry/components/{component-name}/
  {component-name}.html
  registry-item.json
```

**Naming convention:**

| Item name        | ID prefix | Example IDs            |
| ---------------- | --------- | ---------------------- |
| `cap-hormozi`    | `hz`      | `hz-cg-0`, `hz-cw-3`   |
| `cap-typewriter` | `tw`      | `tw-cg-0`, `tw-ch-0-5` |
| `vfx-chrome`     | `vc`      | `vc-canvas`            |

Use a 2-3 letter prefix. ALL element IDs must use this prefix to avoid collisions in sub-compositions.

**registry-item.json** — use the canonical templates in [templates.md](templates.md) (block and component variants, both with all required fields).

### Step 3: Build

Apply the correct template based on type. See [templates.md](templates.md) for copy-paste starters.

#### Caption blocks

**Non-negotiable caption rules:**

- Font: **96px minimum** for proportional fonts. **64-72px acceptable for monospace** (wider characters need less size).
- Readability: `-webkit-text-stroke: 2-3px` OR multi-layer `text-shadow`
- Overflow: call `window.__hyperframes.fitTextFontSize()` on every group
- Karaoke: highlight active word via `tl.to(wordEl, { color/scale }, WORDS[wi].start)`
- Hard kill: `tl.set(groupEl, { opacity: 0, visibility: "hidden" }, g.end)` on EVERY group
- **Never use `tl.from(el, { opacity: 0 })` at the same position as `tl.set(el, { opacity: 1 })`** — the from clobbers the set. Use `tl.to` instead.

**Per-character animation** (typewriter, scramble):

- Wrap each character in `<span>` with ID `{prefix}-ch-{group}-{char}`
- Stagger via `tl.set` at computed intervals from word timestamps
- Cursors/decorative elements: use `tl.set` at intervals — NOT CSS animation (not seekable)

**Positioning variants:**

- Centered: `display: flex; align-items: center; justify-content: center;`
- Lower-third: `position: absolute; bottom: 100px; left: 0; width: 100%; text-align: center;`
- Left-aligned: `position: absolute; bottom: 100px; left: 120px; text-align: left;`

#### VFX blocks (Three.js)

- Use `three@0.147.0` from CDN (global script)
- `tl.eventCallback("onUpdate", renderScene); renderScene();` — NO requestAnimationFrame
- State proxy pattern: GSAP animates plain JS object, render function reads it
- Seeded PRNG (`mulberry32`) for randomness

#### All types

- **Load files the block ships through `__hyperframes.assetUrl("assets/...")`** whenever a script
  builds the path (textures, fonts, JSON, models). Attributes like `src` and `href` are rebased
  when the block is mounted; strings in a script are not, so a bare `"assets/..."` 404s once the
  block lives under `compositions/<name>/`. A separate `.js` file gets the URLs from the block's
  inline script. A block whose assets install to the project's own `assets/` (target
  `compositions/<name>.html`) keeps plain project-root paths; `assetUrl` would look beside the file.
- **Placeholder content is monochrome** — read
  [placeholder-material.md](placeholder-material.md) before choosing a single colour. Stand-in
  screens, images, cards, avatars, logos and chart series use four alpha steps of the
  composition's ink; accent marks one element and never a placeholder.
- `data-composition-id` MUST match `window.__timelines["id"]`
- All element IDs prefixed with block abbreviation
- `gsap.timeline({ paused: true })` — always paused
- No `Math.random()`, no `Date.now()`

### Step 4: Validate

```bash
frames.lint {"project": "/absolute/path/to/project"}                    # 0 errors required
frames.check {"project": "/absolute/path/to/project", "contrast": false}  # 0 console errors required
```

### Step 5: Preview

```bash
# Render preview video
frames.render {"project": "/absolute/path/to/project", "output": "preview.mp4"}

# Snapshot for visual QA
frames.snapshot {"project": "/absolute/path/to/project", "at": [1.0, 3.0, 5.0, 7.0]}
```

Hosted registry previews and publishing are not available in Numen.

### Step 6: Ship

Registry publishing and hosted previews are not available in Numen.
