# /dojo-3d-assets

Source, convert, validate or review Dojo desktop 3D environment assets, including Poly Haven, ambientCG, Sketchfab, Fab, provenance, GLB compatibility and size budgets.

# Dojo 3D assets

1. Source in a scratch directory. Prefer Dojo-authored models or CC0. Accept only CC0, CC BY 3.0/4.0, Fab Standard License free items, and Dojo-authored work. Check the individual listing and dependencies, not the search result alone; reject NC, ND, SA, editorial, paid and unclear licences. Record artist, title, listing URL, explicit licence/version and changes for CC BY. Fab Standard is for incorporated project use, not redistribution of standalone source assets: have Jacob clear the intended distribution before adding a Fab asset to a source tree.
2. Choose the smallest useful source; preserve original downloads outside the repo. Convert in Blender using core glTF 2.0 GLB, embedded BIN, triangles with normals, and no `extensionsUsed` or `extensionsRequired`. Do not use Draco, meshopt compression, quantization, GPU-instancing extensions, WebP/AVIF or KTX2. Bake procedural shapes/material inputs as needed. The Dojo renderer is the reference for final shading, scale, pivots and placement.
3. Run `gltf-transform inspect "$glb"` and `gltf_validator -o "$glb" | jq '.issues | {numErrors,numWarnings,messages}'` (use `set -o pipefail`). Inspect silhouettes before/after any LOD, vertex welding, resizing or material/UV changes. Keep shipped files ≤4 MiB each and the shipped asset set ≤45 MB total; count final bytes, not compressed archive sizes.
4. For every final asset, mirror `crates/dojo-desktop/assets/SOURCES.toml`: `[[asset]]`, `path` relative to the manifest, `kind`, `licence`, source `origin` (stable upstream URL or relative Dojo generator path), and `sha256` of the final file (`sha256sum`). Do not store expiring download URLs, credentials or raw marketplace archives in the repo. Record separate credits where CC BY requires them rather than inventing manifest fields.

## Read-only asset discovery

- [Poly Haven](https://polyhaven.com/our-api) (CC0, no key): `curl -fsSL -A 'Dojo-art-tooling/1.0' 'https://api.polyhaven.com/assets?t=models&c=rocks' | jq -r 'keys[]'`. Then `curl -fsSL -A 'Dojo-art-tooling/1.0' 'https://api.polyhaven.com/files/rock_boulder_cracked' | jq '.gltf["1k"].gltf'`. Inspect `url`, `size`, `md5` and `include` dependencies. Use a clear Poly Haven credit if exposing the live API to users. Select OpenGL normals where the renderer expects them.
- [ambientCG v3](https://docs.ambientcg.com/api/v3/assets/) (CC0, no key): `curl -fsSL 'https://ambientcg.com/api/v3/assets?type=material&q=gravel&limit=2&include=title,url,downloads' | jq '.assets[] | {id,title,url,downloads}'`. Prefer low-resolution PBR textures and use the metadata to choose the ZIP format.
- [Sketchfab Data API](https://sketchfab.com/developers/data-api/v3): `curl -fsSL 'https://api.sketchfab.com/v3/search?type=models&q=japanese%20gate&downloadable=true&licenses=cc0,by&count=2' | jq '.results[] | {name,uid,license}'`. Verify the version, author and model page (`/v3/models/<uid>` provides more metadata) before acquisition. [Download API](https://sketchfab.com/developers/download-api/guidelines) requires a signed-in user/token; GET `/v3/models/<uid>/download` then use the returned temporary archive link. Stop at discovery if Jacob has not provisioned authorized access.
- [Fab](https://dev.epicgames.com/documentation/fab/purchasing-and-downloading-assets-in-fab): browse only; acquisition is through Jacob's Epic account and the documented Fab UI. Verify free price and exact licence. Use CC0 alternatives where possible.

## Visual delivery

Use `blender --background` for reproducible exports/renders and `dojo-blender-mcp --virtual` for optional interactive inspection from a relaunched OMP session. Capture the same camera/lens, lighting, exposure, resolution, seed and animation frame on both sides. Include a route view and diagnostic closeups or wireframe. Open the PNGs, check silhouette/scale/contact and repetition/materials, then verify the candidate in Dojo. Pixel diff is a regression locator, not an art score.
