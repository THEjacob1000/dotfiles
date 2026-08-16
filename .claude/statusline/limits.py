#!/usr/bin/env python3
"""Statusline usage/reset/effort widgets that follow the active model.

gpt*/codex* -> ChatGPT (Codex) rate limits, anything else -> Anthropic limits.
Usage: limits.py {usage|resets|effort}  (statusline JSON on stdin)
"""
import glob
import json
import os
import re
import sys
import time
import urllib.request

CACHE_DIR = os.path.expanduser("~/.cache/ccstatusline")
TTL = 180


def fetch(url, headers, cache_name):
    path = os.path.join(CACHE_DIR, cache_name)
    try:
        if time.time() - os.path.getmtime(path) < TTL:
            return json.load(open(path))
    except OSError:
        pass
    try:
        req = urllib.request.Request(url, headers=headers)
        data = json.load(urllib.request.urlopen(req, timeout=3))
        os.makedirs(CACHE_DIR, exist_ok=True)
        json.dump(data, open(path, "w"))
        return data
    except Exception:
        # ponytail: stale cache beats a blank statusline; upstream refreshes tokens
        try:
            return json.load(open(path))
        except OSError:
            return None


def codex_windows():
    files = glob.glob(os.path.expanduser("~/.cli-proxy-api/codex-*.json"))
    if not files:
        return None
    auth = json.load(open(files[0]))
    data = fetch(
        "https://chatgpt.com/backend-api/wham/usage",
        {"Authorization": "Bearer " + auth["access_token"],
         "chatgpt-account-id": auth.get("account_id", "")},
        "codex-usage.json")
    if not data:
        return None
    out = {}
    for w in (data["rate_limit"].get("primary_window"), data["rate_limit"].get("secondary_window")):
        if not w:
            continue
        key = "session" if w["limit_window_seconds"] <= 21600 else "weekly"
        out[key] = (w["used_percent"], w["reset_at"] - time.time())
    return out


def claude_windows():
    creds = json.load(open(os.path.expanduser("~/.claude/.credentials.json")))
    data = fetch(
        "https://api.anthropic.com/api/oauth/usage",
        {"Authorization": "Bearer " + creds["claudeAiOauth"]["accessToken"],
         "anthropic-beta": "oauth-2025-04-20"},
        "limits-claude.json")
    if not data:
        return None
    import datetime
    out = {}
    for key, field in (("session", "five_hour"), ("weekly", "seven_day")):
        w = data.get(field)
        if not w:
            continue
        # resets_at is null while a window is idle
        at = w.get("resets_at")
        reset = datetime.datetime.fromisoformat(at).timestamp() - time.time() if at else None
        out[key] = (round(w["utilization"]), reset)
    return out


def dur(secs):
    secs = max(0, int(secs))
    h, m = secs // 3600, secs % 3600 // 60
    return f"{h // 24}d {h % 24}h" if h >= 24 else (f"{h}h{m:02d}m" if h else f"{m}m")


def effort(data, model):
    # ccx routes via model ids like "gpt-5.6-sol(medium)"; Claude Code doesn't
    # recognise those, so it omits the effort field and the settings default wins.
    suffix = re.search(r"\(([^)]+)\)", model)
    if suffix:
        return suffix.group(1)
    level = (data.get("effort") or {}).get("level")
    if level:
        return level
    try:
        settings = json.load(open(os.path.expanduser("~/.claude/settings.json")))
        return settings.get("effortLevel")
    except OSError:
        return None


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "usage"
    try:
        data = json.load(sys.stdin)
    except Exception:
        data = {}
    model = (data.get("model", {}).get("id", "") or "").lower()
    if mode == "effort":
        level = effort(data, model)
        if level:
            print(f"Thinking: {level}")
        return
    is_gpt = model.startswith("gpt") or "codex" in model
    w = codex_windows() if is_gpt else claude_windows()
    if not w:
        return
    if mode == "usage":
        parts = [f"Session: {w['session'][0]}%"] if "session" in w else []
        if "weekly" in w:
            parts.append(f"Weekly: {w['weekly'][0]}%")
    else:
        parts = [f"Reset: {dur(w['session'][1])}"] if w.get("session", (0, None))[1] else []
        if w.get("weekly", (0, None))[1]:
            parts.append(f"Weekly Reset: {dur(w['weekly'][1])}")
    print(" | ".join(parts))


main()
