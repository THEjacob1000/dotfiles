/* Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/remotion-to-hyperframes/assets/test-corpus/tier-3-data-driven/remotion-src/src/Root.tsx). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. */
import { Composition } from "remotion";
import { z } from "zod";
import { Stargazed, stargazedSchema } from "./Stargazed";

const defaultProps: z.infer<typeof stargazedSchema> = {
  title: "STARGAZED",
  subtitle: "by HeyGen",
  stats: [
    { label: "Stars", value: 1247, color: "#fbbf24" },
    { label: "Forks", value: 312, color: "#60a5fa" },
    { label: "Issues", value: 48, color: "#f87171" },
  ],
  outro: "thanks for watching",
};

export const RemotionRoot = () => (
  <Composition
    id="Stargazed"
    component={Stargazed}
    schema={stargazedSchema}
    durationInFrames={300}
    fps={30}
    width={1280}
    height={720}
    defaultProps={defaultProps}
  />
);
