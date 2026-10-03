/* Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/remotion-to-hyperframes/assets/test-corpus/tier-3-data-driven/remotion-src/src/components/AnimatedNumber.tsx). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. */
import { interpolate, useCurrentFrame } from "remotion";

interface Props {
  from: number;
  to: number;
  durationInFrames: number;
}

/**
 * Counts from `from` to `to` over `durationInFrames` with easeOut.
 * Driven entirely by useCurrentFrame — deterministic.
 */
export const AnimatedNumber: React.FC<Props> = ({ from, to, durationInFrames }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Ease-out cubic — fast start, slow finish, matches the ramp on data dashboards.
  const eased = 1 - (1 - t) ** 3;
  const value = Math.round(from + (to - from) * eased);
  return <>{value.toLocaleString()}</>;
};
