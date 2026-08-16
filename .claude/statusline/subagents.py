#!/usr/bin/env python3
"""Statusline widget: which subagents are live and what model each is really on.

Claude Code hands the statusline one payload per session, built from the
main-loop model — it carries no signal for which agent pane the TUI is focused
on, so a fable session running opus/gpt subagents reads as all-fable. This lists
the live agents by name with the model from their own transcript instead.
Usage: subagents.py   (statusline JSON on stdin)
"""
import glob
import json
import os
import re
import sys
import time

from common import short_model

# ponytail: mtime is the activity signal — covers Agent-tool and teammate agents
# alike. Bump if a slow agent ever blinks out mid-run.
ACTIVE_WINDOW = 45
MAX_SHOWN = 5
MAX_NAME = 28


def label(path):
    try:
        meta = json.load(open(path[:-6] + ".meta.json"))
        name = meta.get("name") or meta.get("agentType") or ""
    except (OSError, ValueError):
        name = re.sub(r"^agent-a|-?[0-9a-f]{12,}$", "", os.path.basename(path)[:-6])
    return name[: MAX_NAME - 1] + "…" if len(name) > MAX_NAME else name


def last_model(path):
    with open(path, "rb") as fh:
        fh.seek(0, os.SEEK_END)
        fh.seek(max(0, fh.tell() - 32768))
        lines = fh.read().decode("utf8", "replace").splitlines()
    for line in reversed(lines):
        try:
            model = json.loads(line).get("message", {}).get("model")
        except ValueError:
            continue
        if model:
            return short_model(model)
    return None


def main():
    try:
        transcript = json.load(sys.stdin).get("transcript_path") or ""
    except ValueError:
        return
    if not transcript.endswith(".jsonl"):
        return

    cutoff = time.time() - ACTIVE_WINDOW
    live = []
    for path in glob.glob(os.path.join(transcript[:-6], "subagents", "agent-*.jsonl")):
        try:
            mtime = os.path.getmtime(path)
            if mtime < cutoff:
                continue
            model = last_model(path)
        except OSError:
            continue
        if model:
            live.append((mtime, label(path), model))

    if not live:
        return
    live.sort(reverse=True)
    shown = [f"{name}:{model}" if name else model for _, name, model in live[:MAX_SHOWN]]
    extra = len(live) - MAX_SHOWN
    print("⤷ " + ", ".join(shown) + (f" +{extra}" if extra > 0 else ""))


if __name__ == "__main__":
    main()
