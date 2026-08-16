"""Shared helpers for the ccstatusline custom-command widgets."""
import re

GPT_VARIANTS = ("sol", "terra", "luna")


def short_model(name):
    """gpt-5.6-sol(medium) -> sol, claude-opus-5 -> opus, "Fable 5" -> "Fable 5"."""
    name = re.sub(r"\s*\(.*\)$", "", name)
    parts = name.split("-")
    if parts[0] == "claude" and len(parts) > 1:
        return parts[1]
    if parts[-1] in GPT_VARIANTS:
        return parts[-1]
    if " " in name or len(parts) == 1:
        return name
    return "-".join(parts[:2])
