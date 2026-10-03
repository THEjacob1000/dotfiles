<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/motion-graphics/categories/maps/module.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# maps — category module

Geographic motion: highlight regions, connect places, zoom to a location. **First decision: does the shot need a real basemap** (satellite/street/terrain imagery, globe, or zoom to a real address)? That picks the lane.

## Plan (Director)

Set `content.lane` first:

- **vector** (default) — stylized region shapes, no real imagery. Native + live in HF, cheap. `asset_needs: []`.
- **basemap** — needs real satellite/dark tiles, globe, or zoom-to-real-place. `asset_needs: [{ type: "map-bake", … }]`. **Bake the imagery in Source**: HF forbids render-time network and requires determinism, so live tiles (which re-fetch and can change per render) can't be the imagery layer — baking freezes it (and is smooth as a bonus). See Basemap lane + Determinism.

`content`: `{ lane, shot: highlight|flow|choropleth|labels|flag|pin-rollout|zoom-to, regions[], points[], basemap: satellite|dark, palette, headline, overlays: [label|pin|callout-card] }`.

`overlays` are independent of `shot` and work in both lanes. **`callout-card`** = a pinned card (flag chip + stat + progress bar) — this is the "documentary popup" (top #13); compose it on any zoom-to/highlight shot rather than treating it as its own shot.

## Vocabulary / leans on

**Vector lane** (D3 + TopoJSON — reuse the existing map family, don't duplicate):

- Reuse: `us-map` (+bubble/hex/flow), `world-map`, `spain-map`.
- **Hand-author** these (NOT in the catalog — build per the signatures below, don't expect an `add`): `geo-highlight` (N countries colored + labels + border pulse), `geo-flow` (world arcs / hub network), `flag-borders` (flag clipped to a country), `pin-rollout` (cities pulse in sequence + counter).
- Signature: country fill-in stagger · pin drop + pulse ring · arc `stroke-dashoffset` draw-on + flyer · choropleth color reveal · **viewBox** zoom.

**Basemap lane** (MapLibre, baked in Source; suitable for any country):

- **Bake** with `frames.bake_basemap {"project": "/absolute/path/to/project", "name": "br-ar", "style": "satellite", "countries": [{"name": "Brazil", "color": "#22d3ee"}, {"name": "Argentina", "color": "#f59e0b"}], "center": [-60, -25], "zstart": 2.4, "zend": 3.4, "fps": 30, "dur": 5}`. The tool fetches real tiles read-only into the local Numen cache, loads pinned MapLibre/world-atlas/TopoJSON, captures a cubic-eased zoom and held view at 1920×1080, and encodes an all-intra MP4. Incomplete or failed tiles fail the call; there is no substitute imagery.
- **Export geo-to-screen geometry** at the held view. `<NAME>-coords.json` contains `{ "view": {"center":[lng,lat],"zoom":z,"pitch":p,"bearing":b}, "countries": [{"name":"...","color":"...","d":"<SVG path>","bbox":{"x":x,"y":y,"w":w,"h":h},"label":{"x":x,"y":y}}] }`. The label is the projected mainland-ring centroid; adjust it for legibility.
- **Builder:** mount `<NAME>.mp4` as a video on track 0 and layer an SVG overlay using the exported paths. Animate borders and fills, then add labels, pins, or cards. The exported path may also be used as an SVG `clipPath` for a flag or texture fill. Keep the camera still while the projected overlay animates.
- **Options:** `style` is `satellite`, `dark`, `light`, or an HTTPS `{z}/{x}/{y}` template; `hold` defaults to 0.5, `pitch`/`bearing` to zero, and `keepmargin` to `[16,13]` degrees. `out` is project-relative. Defaults are `name:"basemap"`, `center:[2.6,46.6]`, `zstart:4.2`, `zend:5.4`, `fps:30`, `dur:5`. With no countries, only the MP4 is needed and no coordinate file is emitted. Captured frames and localized assets remain available for offline rebaking.

**Stretch / data gaps:** A globe intro requires a globe-to-Mercator camera transition. Sub-national regions need admin-1 geometry, or use centroid pins where appropriate.

## Build (reuse-first)

Vector lane: `frames.add {"project": "/absolute/path/to/project", "name": "<block>"}` → edit regions/data/palette in place. Basemap lane: mount the baked map video as a track-0 `<video>` and bind overlays to projected anchors.

**Restraint (no cheese — this is the #1 way auto-built maps go wrong):** every animated element must serve the message — region, connector, label, pin, camera. **NO decorative ambient glows, background light blobs, floating particles, lens flares, or gratuitous bloom.** Motion = a continuous camera move (viewBox push/zoom) + purposeful, overlapping element reveals — not a light show. Palette: color must **carry meaning** — a data scale (choropleth), categorical fills that distinguish regions (political map), or 1–2 accents for the subjects (highlighted countries / route) over neutral everything-else. Don't add color as **decoration** (a country amber just for contrast, a glow for "energy"). The frame should read like a clean broadcast map, not a screensaver.

**Legibility (hard rule):** offset labels from the highlighted shape and from each other; clamp to the safe area; a callout pill must not sit on another label or a border (the eval surfaced a DE/PL "Oder–Neisse" pill overlapping the POLAND label). A key element stays readable ≥~0.3s.

**Attribution (hard rule):** real basemap imagery carries usage terms — bake a credit element into the composition whenever a basemap is on screen (Esri satellite → "Esri, Maxar, Earthstar Geographics"; CARTO → "© CARTO, © OpenStreetMap"). A small low-corner label (see `smooth-jp`). Non-negotiable for anything published.

**Determinism (hard rules — each one bit us in the prototypes):**

- Drive everything from the seek clock; **never `tl.call`** for stateful updates (counters, text) → proxy tween + `onUpdate` (tl.call freezes the timeline under HF seek).
- SVG zoom = animate **viewBox** (don't hand-compute group transform origins).
- Centered overlays (cards/labels using `transform: translate(-50%,…)` to center): animate **opacity only**, or wrap in an outer centered div - GSAP animating `y`/`scale` overwrites the whole transform and kills the centering.
- Country geometry: filter to the polygon(s) **in a lon/lat box around the subject** - world-atlas bundles overseas territories that blow up the bbox (France + Guiana). Keep near islands (Corsica, Sicily), drop far ones; anchor on the vertex-richest polygon with a keep-margin rather than a continent-specific constant.
- **Antimeridian:** unwrap longitudes around the camera-center reference before projecting, and warn if a feature still spans more than 180 degrees.
- **Smoothness = complete tiles per frame + eased camera.** Wait for map idle before every capture to prevent tile pop; use an eased camera, preserve drawing buffers, disable tile fade, and keep a large tile cache.
- **Overlay alignment**: project feature borders at a **held** camera and only animate the overlay during the hold — a moving camera + a fixed projected path drift apart.
- **Pre-hold hidden state**: an overlay revealed _at_ the hold must be `gsap.set` to its hidden state at build time (`scaleX:0`, full `stroke-dashoffset`, `opacity:0`) — a bare `fromTo` does **not** apply its "from" until the tween starts, so the element otherwise shows at its natural (visible, mispositioned) state during the zoom-in.
- **Why bake at all** (the real reason — not just smoothness): baking freezes the imagery into **deterministic** pixels. Live raster tiles re-fetch every render and can change, and render-time network is forbidden. MapLibre _does_ render live in HF (just janky: tiles pop, deep zooms outrun loading); exposing the engine's per-frame `onBeforeCapture` hook (it exists — `frameCapture.ts:~1250`) would make live **smooth** — but it would **not** remove the need to freeze tiles for **determinism + offline reproducibility**. So `onBeforeCapture` would replace the _smoothness_ role of baking, not the _freeze_ role.

## Out of scope

3D photorealistic landmarks (Cesium territory) · per-country / per-template blocks (parametrize instead) · charts (→ `charts`). (In-engine _live_ MapLibre is possible but janky today — bake instead; revisit if the engine gains a per-frame ready hook.)

## Register

`director.md` classifier line (the lane fork) + `catalog-map.md` `maps/geo` row (add the basemap lane). Phase pipeline untouched.
