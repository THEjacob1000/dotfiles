/* Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/remotion-to-hyperframes/assets/test-corpus/tier-1-title-card/remotion-src/src/Root.tsx). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. */
import { Composition } from "remotion";
import { TitleCard } from "./TitleCard";

export const RemotionRoot = () => (
  <Composition
    id="TitleCard"
    component={TitleCard}
    durationInFrames={90}
    fps={30}
    width={1280}
    height={720}
  />
);
