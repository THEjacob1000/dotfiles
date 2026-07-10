#!/usr/bin/env bash
# SUPERSEDED by `numen sync`. The canonical harness store now lives in the numen
# repo at harness/canonical/ (doctrine.md + skills/), projected into ~/.claude and
# ~/.codex by harness/sync.mjs. This script used to regenerate ~/.codex/AGENTS.md
# wholesale from .claude/DOCTRINE.md + codex-supplement.md; it is kept as a shim so
# any habit or automation that still invokes it runs the real sync instead of
# resurrecting the two-writers clobber fight. Edit doctrine/skills in the numen
# repo (harness/canonical/), not here.
set -euo pipefail
exec node /home/jacob/Documents/Developer/numen/harness/sync.mjs "$@"
