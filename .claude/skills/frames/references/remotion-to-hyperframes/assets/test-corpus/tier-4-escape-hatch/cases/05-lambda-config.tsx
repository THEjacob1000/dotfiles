/* Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/remotion-to-hyperframes/assets/test-corpus/tier-4-escape-hatch/cases/05-lambda-config.tsx). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. */
// T4 case 05 — Imports @remotion/lambda for distributed rendering config.
//
// This case demonstrates warning r2hf/lambda-import.
// The skill drops the Lambda code with a note (HF runs single-machine
// today) and translates the rest of the composition.
//
// Why this is a warning, not a blocker: @remotion/lambda config is
// orthogonal to the rendered composition — it's deployment configuration,
// not animation logic. Treating it as a hard blocker would refuse
// translation for compositions that are otherwise clean. The skill drops
// the Lambda calls in step 3 (Generate) and writes a TRANSLATION_NOTES.md
// entry so the user knows to set up HF rendering separately.

import React from "react";
import { renderMediaOnLambda } from "@remotion/lambda";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const LambdaConfigured: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1]);
  return (
    <AbsoluteFill style={{ opacity }}>
      <div>frame {frame}</div>
    </AbsoluteFill>
  );
};

// Rendered at scale via Lambda — no HF equivalent.
export async function renderViaLambda() {
  return renderMediaOnLambda({
    region: "us-east-1",
    functionName: "remotion-render",
    composition: "LambdaConfigured",
    serveUrl: "https://example.com/bundle",
    inputProps: {},
    codec: "h264",
  });
}
