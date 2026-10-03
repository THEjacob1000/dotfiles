/* Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/remotion-to-hyperframes/assets/test-corpus/tier-3-data-driven/remotion-src/src/scenes/StatsScene.tsx). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. */
import { AbsoluteFill } from "remotion";
import { StatCard } from "../components/StatCard";

interface Stat {
  label: string;
  value: number;
  color: string;
}

interface Props {
  stats: Stat[];
}

export const StatsScene: React.FC<Props> = ({ stats }) => (
  <AbsoluteFill
    style={{
      justifyContent: "center",
      alignItems: "center",
      gap: 48,
      flexDirection: "row",
      fontFamily: "Helvetica, Arial, sans-serif",
    }}
  >
    {stats.map((stat, i) => (
      <StatCard
        key={stat.label}
        label={stat.label}
        value={stat.value}
        color={stat.color}
        delayInFrames={i * 12}
      />
    ))}
  </AbsoluteFill>
);
