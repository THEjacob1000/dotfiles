#!/usr/bin/env python3
"""Statusline effort widget that also understands proxied gpt models.

ccstatusline's built-in Thinking widget reads only /effort transcript lines and
settings.effortLevel, so sol/luna/terra sessions — where the reasoning level
rides in the model id as "gpt-5.6-sol(medium)" — always showed the stale Claude
effortLevel. Parse the model id first, then fall back to the built-in sources.
Usage: effort.py   (statusline JSON on stdin)
"""
import json
import os
import re
import sys

SETTINGS = os.path.expanduser("~/.claude/settings.json")
SET_EFFORT = re.compile(r"Set effort level to ([a-zA-Z0-9-]+)\b", re.I)
SET_MODEL_EFFORT = re.compile(
    r"Set model to .*?(?:with ([a-zA-Z0-9-]+) effort|\(([a-zA-Z0-9-]+)\))", re.I
)


def from_model_id(data):
    model = data.get("model") or {}
    name = model if isinstance(model, str) else (model.get("id") or model.get("display_name") or "")
    match = re.search(r"\(([a-zA-Z0-9-]+)\)\s*$", name)
    return match.group(1) if match else None


def from_transcript(path):
    try:
        with open(path, "rb") as fh:
            lines = fh.read().decode("utf8", "replace").splitlines()
    except OSError:
        return None
    for line in reversed(lines):
        if "local-command-stdout" not in line:
            continue
        try:
            content = json.loads(line).get("message", {}).get("content")
        except ValueError:
            continue
        if not isinstance(content, str):
            continue
        # ponytail: /model output is ANSI-bolded, so match anywhere in the line
        for pattern in (SET_EFFORT, SET_MODEL_EFFORT):
            match = pattern.search(content)
            if match:
                return next(g for g in match.groups() if g)
    return None


def from_settings():
    try:
        return json.load(open(SETTINGS)).get("effortLevel")
    except (OSError, ValueError):
        return None


def main():
    try:
        data = json.load(sys.stdin)
    except ValueError:
        data = {}
    effort = from_model_id(data) or from_transcript(data.get("transcript_path") or "") or from_settings()
    print(f"Thinking: {effort or 'default'}")


if __name__ == "__main__":
    main()
