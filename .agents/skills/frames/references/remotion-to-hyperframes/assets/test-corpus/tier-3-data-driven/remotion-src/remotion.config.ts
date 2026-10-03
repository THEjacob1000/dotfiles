/* Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/remotion-to-hyperframes/assets/test-corpus/tier-3-data-driven/remotion-src/remotion.config.ts). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. */
import { Config } from "@remotion/cli/config";

// Match HyperFrames' default render so SSIM diffs measure translation
// fidelity, not encoder differences.
//
//   setVideoImageFormat("png") avoids the JPEG limited-range/full-range
//   colorspace flag (yuvj420p vs yuv420p) that otherwise costs ~0.05 SSIM.
//
//   setColorSpace("bt709") matches HF's BT.709 SDR output.
Config.setVideoImageFormat("png");
Config.setColorSpace("bt709");
Config.setOverwriteOutput(true);
Config.setConcurrency(1);
