"""Shared helpers for parsing LLM text responses."""

from __future__ import annotations

import json
import re
from typing import Any

_FENCE_RE = re.compile(r"^```(?:\w+)?\s*\n?(.*?)\n?```\s*$", re.DOTALL)


def strip_fences(text: str) -> str:
    """Remove surrounding markdown code fences if present."""
    stripped = text.strip()
    match = _FENCE_RE.match(stripped)
    return match.group(1).strip() if match else stripped


def parse_json(text: str) -> Any | None:
    """Parse JSON from an LLM response, tolerating markdown fences."""
    candidate = strip_fences(text)
    try:
        return json.loads(candidate)
    except json.JSONDecodeError:
        return None


def extract_sql(text: str) -> str:
    """Strip fences and whitespace from an LLM SQL response."""
    return strip_fences(text)
