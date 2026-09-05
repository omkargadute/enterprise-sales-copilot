"""ElevenLabs text-to-speech integration."""

from __future__ import annotations

import logging
from typing import Literal

import httpx

from backend.config import settings

logger = logging.getLogger(__name__)

ELEVENLABS_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech"

Speaker = Literal["sales", "customer"]

_VOICE_IDS: dict[Speaker, str] = {
    "sales": settings.elevenlabs_voice_sales,
    "customer": settings.elevenlabs_voice_customer,
}


async def synthesize(text: str, speaker: Speaker) -> bytes:
    """Convert text to speech using ElevenLabs. Returns MP3 audio bytes."""
    if speaker not in _VOICE_IDS:
        raise ValueError(f"Unknown speaker: {speaker!r}")

    url = f"{ELEVENLABS_TTS_URL}/{_VOICE_IDS[speaker]}"
    headers = {
        "xi-api-key": settings.elevenlabs_api_key,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }
    payload = {
        "text": text,
        "model_id": "eleven_turbo_v2_5",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
            "style": 0.4,
        },
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.content
