/* Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/remotion-to-hyperframes/assets/test-corpus/tier-4-escape-hatch/cases/02-use-effect-deps.tsx). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. */
// T4 case 02 — useEffect with non-empty deps performs side effects per render.
//
// This case demonstrates blocker r2hf/use-effect-deps.
// The skill should refuse to translate.
//
// Why this is a blocker: side effects (network, DOM mutation outside the
// rendered tree, timers) don't translate to a seek-driven model. HF assumes
// the page is fully rendered and pure between seeks.

import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export const SideEffectDriven: React.FC = () => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.fillRect(frame, frame, 10, 10);
  }, [frame]);

  return (
    <AbsoluteFill>
      <canvas ref={canvasRef} width={1280} height={720} />
    </AbsoluteFill>
  );
};
