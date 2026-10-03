/* Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/remotion-to-hyperframes/assets/test-corpus/tier-2-multi-scene/remotion-src/src/MultiScene.tsx). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. */
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const TitleScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 12, stiffness: 100, mass: 1 } });
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
          fontSize: 140,
          fontWeight: 800,
          color: "#ffffff",
          transform: `scale(${scale})`,
          letterSpacing: "0.05em",
        }}
      >
        Welcome
      </div>
    </AbsoluteFill>
  );
};

const ImageScene = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, 60], [0.8, 1.0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Img
        src={staticFile("square.png")}
        style={{
          width: 200,
          height: 200,
          opacity,
          transform: `scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};

const OutroScene = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
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
          fontSize: 100,
          fontWeight: 600,
          color: "#ffffff",
          opacity,
        }}
      >
        Goodbye
      </div>
    </AbsoluteFill>
  );
};

export const MultiScene = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={60}>
      <TitleScene />
    </Sequence>
    <Sequence from={60} durationInFrames={60}>
      <ImageScene />
    </Sequence>
    <Sequence from={120} durationInFrames={60}>
      <OutroScene />
    </Sequence>
    <Audio src={staticFile("music.wav")} volume={0.5} />
  </AbsoluteFill>
);
