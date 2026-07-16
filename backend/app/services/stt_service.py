import asyncio
from functools import partial

from ..config import settings


class STTService:
    async def transcribe(self, audio_path: str) -> str:
        raise NotImplementedError


class FasterWhisperSTT(STTService):
    """Local STT using faster-whisper."""

    def __init__(self):
        from faster_whisper import WhisperModel

        self.model = WhisperModel(
            "large-v3", device="cpu", compute_type="int8"
        )

    async def transcribe(self, audio_path: str) -> str:
        loop = asyncio.get_event_loop()
        segments, info = await loop.run_in_executor(
            None,
            partial(
                self.model.transcribe,
                audio_path,
                beam_size=5,
                vad_filter=True,
            ),
        )
        return " ".join(seg.text.strip() for seg in segments)


class OpenAIWhisperSTT(STTService):
    """Cloud STT using OpenAI Whisper API."""

    def __init__(self):
        from openai import OpenAI

        self.client = OpenAI(api_key=settings.openai_api_key)

    async def transcribe(self, audio_path: str) -> str:
        loop = asyncio.get_event_loop()

        def _call():
            with open(audio_path, "rb") as f:
                return self.client.audio.transcriptions.create(
                    model="whisper-1", file=f, response_format="text"
                )

        result = await loop.run_in_executor(None, _call)
        return result.text


def get_stt_service() -> STTService:
    if settings.stt_mode == "api":
        return OpenAIWhisperSTT()
    return FasterWhisperSTT()
