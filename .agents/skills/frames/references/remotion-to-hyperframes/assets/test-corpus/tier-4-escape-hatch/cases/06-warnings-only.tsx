/* Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/remotion-to-hyperframes/assets/test-corpus/tier-4-escape-hatch/cases/06-warnings-only.tsx). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. */
// T4 case 06 — Patterns that warn but don't block.
//
// This case demonstrates warnings that do not block translation:
// r2hf/delay-render, r2hf/use-callback, and r2hf/use-memo.
//
// 0 blockers expected — the skill should still translate this composition
// after dropping the wrappers. delayRender is paired with continueRender via
// an empty-deps useEffect (mount-once side effect), which doesn't trip the
// use-effect-deps blocker.

import React, { useCallback, useMemo } from "react";
import { AbsoluteFill, delayRender, continueRender, useCurrentFrame, interpolate } from "remotion";

const handle = delayRender();
// Resolve the handle once at module load — no per-frame side effects.
queueMicrotask(() => continueRender(handle));

export const WarningsOnly: React.FC = () => {
  const frame = useCurrentFrame();

  // useCallback / useMemo — decorative for render-perf in React, no equivalent
  // needed in the seek-driven HF model.
  const opacity = useMemo(
    () => interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" }),
    [frame],
  );
  const onMount = useCallback(() => {}, []);

  return (
    <AbsoluteFill style={{ opacity }} onClick={onMount}>
      <div>frame {frame}</div>
    </AbsoluteFill>
  );
};
