<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/hyperframes-registry/SKILL.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->


The frames skill and its references ship with Numen and are projected by `numen sync`.

# HyperFrames Registry

The registry provides reusable blocks and components installable via `frames.add {"project": "/absolute/path/to/project", "name": "<name>"}`.

- **Blocks** - standalone sub-compositions (own dimensions, duration, timeline). Included via `data-composition-src` in a host composition.
- **Components** - effect snippets (no own dimensions). Pasted directly into a host composition's HTML.

## Quick reference

```bash
frames.add {"project": "/absolute/path/to/project", "name": "data-chart"}              # install a block
frames.add {"project": "/absolute/path/to/project", "name": "grain-overlay"}           # install a component
frames.add {"project": "/absolute/path/to/project", "name": "captions"}                # install every block tagged captions
frames.add {"name": "shimmer-sweep", "project": "/absolute/path/to/project"}   # target a specific project
frames.add {"project": "/absolute/path/to/project", "name": "data-chart"}       # machine-readable output
frames.add {"project": "/absolute/path/to/project", "name": "data-chart"}  # explicit destination
```

After install, `frames.add` reports which files were written and a snippet to paste into your host composition. The snippet is a starting point - add `data-composition-id` (must match the block's internal composition ID), `data-start`, and `data-track-index` attributes when wiring blocks.

The positional value is resolved as an exact item name first. If no item matches and the value is a tag, the command installs every block with that tag. Registry dependencies are installed before the requested item. `frames.add` and `frames.catalog` operate on Numen's local catalog. `frames.add` works only for blocks and components; for examples, use `frames.init {"project": "/absolute/path/to/project", "example": "<name>"}` instead.

## Install locations

Blocks install to `compositions/<name>.html` by default. Components install to `compositions/components/<name>.html` by default.

These paths are configurable in `hyperframes.json`:

```json
{
  "paths": {
    "blocks": "compositions",
    "components": "compositions/components",
    "assets": "assets"
  }
}
```

See [install-locations.md](registry/references/install-locations.md) for full details.

## Wiring blocks

Blocks are standalone compositions - include them via `data-composition-src` in your host `index.html`:

```html
<div
  data-composition-id="data-chart"
  data-composition-src="compositions/data-chart.html"
  data-start="2"
  data-duration="15"
  data-track-index="1"
  data-width="1920"
  data-height="1080"
></div>
```

Key attributes:

- `data-composition-src` - path to the block HTML file
- `data-composition-id` - must match the block's internal ID
- `data-start` - when the block appears in the host timeline (seconds)
- `data-duration` - how long the block plays
- `data-width` / `data-height` - block canvas dimensions
- `data-track-index` - layer ordering (higher = in front)

See [wiring-blocks.md](registry/references/wiring-blocks.md) for full details.

## Wiring components

Components are snippets - paste their HTML into your composition's markup, their CSS into your style block, and their JS into your script (if any):

1. Read the installed file (e.g., `compositions/components/grain-overlay.html`)
2. Copy the HTML elements into your composition's `<div data-composition-id="...">`
3. Copy the `<style>` block into your composition's styles
4. Copy any `<script>` content into your composition's script (before your timeline code)
5. If the component exposes GSAP timeline integration (see the comment block in the snippet), add those calls to your timeline

See [wiring-components.md](registry/references/wiring-components.md) for full details.

## Discovery

Use `frames.catalog` as the primary discovery surface. **Search by intent before browsing:** the local Numen catalog may contain more items than you can scan by eye, so listing them and matching on names or tags is the slow path, and it fails whenever the author's wording differs from yours.

```bash
# Rank the local catalog against what the beat should do
frames.catalog {"query": "reveal a headline one line at a time"}
frames.add {"project": "/absolute/path/to/project", "name": "caption-clip-wipe"}
```

Search is local and sends nothing. By default it ranks on vocabulary shared with the item's name, title and description; with `--json` the envelope names which tier answered, so check that rather than assuming a ranking happened.

**Always query in English, whatever language the video is in.** The catalog is written in English, so describe the _move_ in English, then write the on-screen copy in whatever language the video needs.

To browse or filter instead of search:

```bash
frames.catalog
frames.catalog {"type": "block"}
frames.catalog {"type": "component"}
frames.catalog {"type": "block", "tag": "social"}
frames.catalog {}
```

Catalog calls return JSON matches; install a selected name with `frames.add {"project": "/absolute/path/to/project", "name": "<name>"}`. Interactive pickers are unavailable.

### Report what the catalog does not have

When the search comes back and nothing does the job, say so before hand-authoring the move.

**Report whenever nothing in the results does the job.** Describe the effect you wanted, not the item name you imagined.

See [discovery.md](registry/references/discovery.md) for details on filtering by type and tags.

## Contributing a new block or component

To author a new reusable registry item, follow [contributing.md](registry/references/contributing.md) for the build, validation, and local preview workflow. Registry publishing and hosted registry URLs are not available in Numen.
