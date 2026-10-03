/* Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/remotion-to-hyperframes/assets/test-corpus/tier-3-data-driven/remotion-src/src/Stargazed.tsx). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. */
import { AbsoluteFill, Sequence } from "remotion";
import { z } from "zod";
import { TitleScene } from "./scenes/TitleScene";
import { StatsScene } from "./scenes/StatsScene";
import { OutroScene } from "./scenes/OutroScene";

export const stargazedSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  stats: z.array(
    z.object({
      label: z.string(),
      value: z.number(),
      color: z.string(),
    }),
  ),
  outro: z.string(),
});

export const Stargazed: React.FC<z.infer<typeof stargazedSchema>> = ({
  title,
  subtitle,
  stats,
  outro,
}) => (
  <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
    <Sequence from={0} durationInFrames={90}>
      <TitleScene title={title} subtitle={subtitle} />
    </Sequence>
    <Sequence from={90} durationInFrames={120}>
      <StatsScene stats={stats} />
    </Sequence>
    <Sequence from={210} durationInFrames={90}>
      <OutroScene text={outro} />
    </Sequence>
  </AbsoluteFill>
);
