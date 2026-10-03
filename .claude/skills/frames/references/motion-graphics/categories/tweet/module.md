<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/motion-graphics/categories/tweet/module.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# tweet — category module (search-driven)

**Search a tweet → animate the tweet card.** Grounded in a real post (RWA). ~4–8s.

## Source (Step 2)

RWA `search_tweets` (specific query, or a given tweet URL/id) → tweet: author, handle, avatar, text, timestamp, metrics (likes/reposts). `asset_needs`: `{ kind: tweet, query|source, treatment: none }`. Freeze the avatar + any embedded media.

## Vocabulary / leans on

- Block: registry **`x-post`** (animated X/Twitter post card overlay with engagement metrics) — reuse it directly.
- Primitives: card slide/scale-in · text type-on / line reveal · avatar pop · metrics **count-up** · optional emphasis on a keyword.

## Build (reuse-first)

`frames.add {"project": "/absolute/path/to/project", "name": "x-post"}` → fill author, handle, avatar, text, and metrics from the resolved tweet; animate the card in, type-on the text (or reveal it line by line), and count up metrics. Keep avatar and media project-local, never as remote URLs. Use `export: alpha-overlay` when intended for other footage.
