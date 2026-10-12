<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/e1925d4317fcd13c0e5799cd4767a3e2dd4c9238/skills/hyperframes-registry/SKILL.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->


The frames skill and its references ship with Numen and are projected by `numen sync`.

# HyperFrames Registry

The registry provides reusable blocks and components installable via `frames.add {"project": "/absolute/path/to/project", "name": "<name>"}`.

- **Blocks** - standalone sub-compositions (own dimensions, duration, timeline). Included via `data-composition-src` in a host composition.
- **Components** - effect snippets (no own dimensions). Pasted directly into a host composition's HTML.

## Quick reference

```bash
frames.add {"project": "/absolute/path/to/project", "name": "data-chart"}              # install a block
frames.add {"project": "/absolute/path/to/project", "name": "grain-overlay"}           # install a component
frames.add {"name": "shimmer-sweep", "project": "/absolute/path/to/project"}   # target a specific project
frames.add {"project": "/absolute/path/to/project", "name": "data-chart"}       # machine-readable output
frames.add {"project": "/absolute/path/to/project", "name": "data-chart"}  # explicit destination
```

After install, `frames.add` reports the installed file paths and item names. Read the installed HTML when wiring a block into the host: add `data-composition-id` (must match the block's internal composition ID), `data-start`, and `data-track-index` attributes.

`frames.add` resolves exact item names only. To install by tag, list `frames.catalog {"type": "block", "tag": "<tag>"}` and call `frames.add` once per name. Registry dependencies are installed before the requested item. `frames.catalog` and `frames.add` use only the pinned upstream GitHub registry. Catalog discovery requires network access but no project, account or separate installation; adding an item also fetches its files over the network. `frames.add` works only for blocks and components; for examples, use `frames.init {"project": "/absolute/path/to/project", "example": "<name>"}` instead.

## Install locations

Files install at each manifest file's `target`, including any declared asset paths. Read the installed paths in the `frames.add` report.

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
- `data-track-index` - timeline row; display only. Use CSS `z-index` for layering

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

Use `frames.catalog` as the primary discovery surface. **Search by intent before browsing:** the pinned upstream registry may contain more items than you can scan by eye, so listing them and matching on names or tags is the slow path, and it fails whenever the author's wording differs from yours.

```bash
# Rank the pinned upstream registry against what the beat should do
frames.catalog {"query": "reveal a headline one line at a time"}
frames.add {"project": "/absolute/path/to/project", "name": "caption-clip-wipe"}
```

Search ranks locally against the fetched or cached pinned upstream registry, using names, titles, descriptions and tags. Fetching requires network access or a warm registry cache. Responses are always JSON; the query envelope identifies the ranking tier.

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

When a complete search returns no suitable match, say so before hand-authoring the move. Check `warnings`: registry-index-unavailable, metadata-unavailable and cancellation/deadline warnings mean discovery failed or is incomplete, not that no match exists. Asset-origin/license provenance warnings concern only returned catalog items (after query, type, tag and limit filtering), or installed items and their dependencies in `frames.add`. They do not mean discovery failed; resolve them before using affected assets.
Metadata lookup diagnostics remain in top-level `warnings` even when a tag, query or limit excludes the unavailable item. In raw catalog entries, `discovery_warnings` holds these lookup diagnostics separately from item-specific provenance `warnings`.

**Report whenever nothing in the results does the job.** Describe the effect you wanted, not the item name you imagined.

See [discovery.md](registry/references/discovery.md) for details on filtering by type and tags.

## Contributing a new block or component

To author a new reusable registry item, follow [contributing.md](registry/references/contributing.md) for the build, validation, and local preview workflow. Registry publishing and hosted preview generation are not available in Numen; fetching the pinned upstream catalog and item files is supported.
