/* Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/remotion-to-hyperframes/assets/test-corpus/tier-1-title-card/remotion-src/src/TitleCard.tsx). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. */
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const TitleCard = () => {
  const frame = useCurrentFrame();

  // Fade in 0-15, hold 15-75, fade out 75-90.
  const opacity = interpolate(frame, [0, 15, 75, 90], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 160,
          fontWeight: 800,
          color: "#ffffff",
          opacity,
          letterSpacing: "0.05em",
        }}
      >
        HELLO
      </div>
    </AbsoluteFill>
  );
};
