/* Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/remotion-to-hyperframes/assets/test-corpus/tier-3-data-driven/remotion-src/src/scenes/OutroScene.tsx). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. */
import { AbsoluteFill } from "remotion";
import { UnderlinedText } from "../components/UnderlinedText";

interface Props {
  text: string;
}

export const OutroScene: React.FC<Props> = ({ text }) => (
  <AbsoluteFill
    style={{
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Helvetica, Arial, sans-serif",
    }}
  >
    <UnderlinedText text={text} color="#fbbf24" />
  </AbsoluteFill>
);
