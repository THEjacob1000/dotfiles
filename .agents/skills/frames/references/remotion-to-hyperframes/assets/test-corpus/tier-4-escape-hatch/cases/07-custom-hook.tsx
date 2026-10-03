/* Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/remotion-to-hyperframes/assets/test-corpus/tier-4-escape-hatch/cases/07-custom-hook.tsx). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. */
// T4 case 07 — Locally-defined custom hook.
//
// This case demonstrates warning r2hf/custom-hook.
// 0 blockers expected — the skill can attempt translation if the hook body
// is pure (derives from props/frame alone).
//
// Why this is a warning: custom hooks vary widely in what they do. Some are
// pure derivations of useCurrentFrame (translatable — inline the body); some
// wrap useState/useEffect (blocker — but those will be caught by the other
// rules independently). The warning prompts the agent to inspect the body.

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

// Custom hook — pure derivation from frame, no state. Translates fine.
function useFadeIn(durationInFrames: number) {
  const frame = useCurrentFrame();
  return interpolate(frame, [0, durationInFrames], [0, 1], { extrapolateRight: "clamp" });
}

export const CustomHookDriven: React.FC = () => {
  const opacity = useFadeIn(30);
  return (
    <AbsoluteFill style={{ opacity }}>
      <div>fading in</div>
    </AbsoluteFill>
  );
};
