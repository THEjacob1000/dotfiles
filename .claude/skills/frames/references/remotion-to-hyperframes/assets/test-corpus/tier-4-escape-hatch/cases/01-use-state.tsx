/* Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/remotion-to-hyperframes/assets/test-corpus/tier-4-escape-hatch/cases/01-use-state.tsx). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. */
// T4 case 01 — useState drives animation.
//
// This case demonstrates blocker r2hf/use-state.
// The skill should refuse to translate and recommend the runtime interop
// pattern from PR #214.
//
// Why this is a blocker: useState is React's component-local mutable state.
// HF's seek-driven model produces deterministic frames from a single time
// value — there's no per-frame React render cycle to update state on.

import React, { useState } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export const StateDriven: React.FC = () => {
  const frame = useCurrentFrame();
  const [hue, setHue] = useState(0);

  // Even if this looks innocuous, the setHue call breaks determinism: HF
  // can't reproduce React state mutations across seeks.
  if (frame % 30 === 0 && hue < 360) {
    setHue((h) => h + 30);
  }

  return (
    <AbsoluteFill style={{ background: `hsl(${hue}, 80%, 50%)` }}>
      <div>frame {frame}</div>
    </AbsoluteFill>
  );
};
