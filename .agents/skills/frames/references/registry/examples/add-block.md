<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/hyperframes-registry/examples/add-block.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# Worked Example: Adding a Block

## Scenario

User has an existing HyperFrames project and wants to add an animated chart alongside their video content.

## Steps

### 1. Install the block

```bash
frames.add {"project": "/absolute/path/to/project", "name": "data-chart"}
```

### 2. Wire into index.html

```html
<div id="stage" data-composition-id="main" data-width="1920" data-height="1080" data-duration="30">
  <video
    id="speaker"
    src="speaker.mp4"
    data-start="0"
    data-duration="30"
    data-track-index="0"
    style="position: absolute; width: 60%; height: 100%; left: 0; top: 0; object-fit: cover;"
  ></video>

  <!-- Data chart appears at 5s in the right 40% of the screen -->
  <div
    data-composition-id="data-chart"
    data-composition-src="compositions/data-chart.html"
    data-start="5"
    data-duration="15"
    data-track-index="1"
    data-width="1920"
    data-height="1080"
    style="position: absolute; right: 0; top: 0; width: 40%; height: 100%;"
  ></div>
</div>
```

### 3. Lint and preview

```bash
frames.lint {"project": "/absolute/path/to/project"}
frames.preview {"project": "/absolute/path/to/project"}
```

### 4. Customize (optional)

Edit `compositions/data-chart.html` — data arrays are at the top of the script, colors are in the CSS rules scoped under `[data-composition-id="data-chart"]`.
