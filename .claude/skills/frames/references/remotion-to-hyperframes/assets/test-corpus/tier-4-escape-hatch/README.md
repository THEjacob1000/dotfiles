<!-- Ported from HyperFrames (https://github.com/heygen-com/hyperframes/blob/73489331114b89f42b5bc843765e610525188bcb/skills/remotion-to-hyperframes/assets/test-corpus/tier-4-escape-hatch/README.md). Copyright 2026 HeyGen, Inc. Licensed under the Apache License, Version 2.0; see LICENSE in the frames skill. Modified for Numen: commands rewritten to the Numen frames.* MCP tools and remote services removed. -->
# Tier 4 — escape-hatch

## What it tests

T4 is the **lint-only** tier. There are no renders to diff — the skill is
graded on whether it correctly _refuses_ to translate each case (and
recommends the runtime interop pattern from PR #214 instead) or, where
appropriate, translates after dropping warning-level decorations.

Each `cases/*.tsx` file is a minimal Remotion composition that
demonstrates one specific pattern. The skill should:

1. Run `frames.remotion_lint` for each case to obtain blockers and warnings.
2. Compare findings with `expected.json` and follow the documented action.
   - `refuse_translation_recommend_interop` — print the rationale + link to
     the PR #214 interop guide; do not produce HF output.
   - `drop_lambda_code_translate_remainder_if_clean` — drop the
     `@remotion/lambda` code with a note; translate the rest only if no
     other blockers are present.
   - `translate_after_dropping_wrappers` — translate normally; drop
     `useCallback` / `useMemo` / `delayRender` wrappers.
   - `inline_hook_body_if_pure` — inline the custom hook's body if it's a
     pure derivation of `useCurrentFrame`; otherwise bow out.

## Cases

| #   | File                       | Expected finding                    | Notes                                           |
| --- | -------------------------- | ----------------------------------- | ----------------------------------------------- |
| 01  | `01-use-state.tsx`         | blocker `r2hf/use-state`            | useState driving animation                      |
| 02  | `02-use-effect-deps.tsx`   | blocker `r2hf/use-effect-deps`      | useEffect/useLayoutEffect with non-empty deps   |
| 03  | `03-async-metadata.tsx`    | blocker `r2hf/async-metadata`       | calculateMetadata returns a Promise             |
| 04  | `04-third-party-react.tsx` | blocker `r2hf/third-party-react-ui` | imports `@mui/material`                         |
| 05  | `05-lambda-config.tsx`     | warning `r2hf/lambda-import`        | imports `@remotion/lambda` — drops, translates  |
| 06  | `06-warnings-only.tsx`     | warnings only                       | delayRender / useCallback / useMemo             |
| 07  | `07-custom-hook.tsx`       | warning `r2hf/custom-hook`          | locally-defined `useFadeIn` (export const form) |
| 08  | `08-mixed.tsx`             | 3 blockers + 1 warning              | aggregate-findings test                         |

## Validation

Run `frames.remotion_corpus {"project": "/absolute/path/to/project", "tier": "tier-4-escape-hatch"}`.
The Rust runner checks rule minimum counts, severity floors and implied blocker
exit status for all eight cases without Node or ffmpeg. `run-report.json` records
case failures; missing or unreadable cases never become successful fixtures.
