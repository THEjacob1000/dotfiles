#!/usr/bin/env python3
"""Statusline model widget with proxied gpt names compressed to their variant.

ccstatusline's built-in Model widget prints the raw id minus its parenthetical,
i.e. "gpt-5.6-sol". The version adds nothing here — the variant is the part worth
reading. Claude display names ("Fable 5") pass through untouched.
Usage: model.py   (statusline JSON on stdin)
"""
import json
import sys

from common import short_model


def main():
    try:
        model = json.load(sys.stdin).get("model") or {}
    except ValueError:
        return
    name = model if isinstance(model, str) else (model.get("display_name") or model.get("id") or "")
    if name:
        # first char only — .capitalize() would lowercase "Fable 5"'s tail
        short = short_model(name)
        print(f"Model: {short[:1].upper()}{short[1:]}")


if __name__ == "__main__":
    main()
