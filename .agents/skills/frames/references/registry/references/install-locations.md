<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/e1925d4317fcd13c0e5799cd4767a3e2dd4c9238/skills/hyperframes-registry/references/install-locations.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# Install Locations

## Manifest targets

`frames.add` installs each file at the `target` declared in its pinned
`registry-item.json`, including declared assets and registry dependencies.
Targets commonly use `compositions/<name>.html` for blocks and
`compositions/components/<name>.html` for components.

`hyperframes.json#paths` does not remap these targets. Read the installed file
paths and item names in the `frames.add` report, then wire the installed HTML
into the host composition.
