import asyncio
from functools import partial


class STTService:
    async def transcribe(self, audio_path: str) -> str:
        raise NotImplementedError


class FasterWhisperSTT(STTService):
    """Local STT using faster-whisper."""

    def __init__(self):
        try:
            from faster_whisper import WhisperModel
        except ImportError:
            raise RuntimeError(
                "faster-whisper not installed. Run: pip install faster-whisper"
            )
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

    def __init__(self, api_key: str):
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY not set")
        from openai import OpenAI

        self.client = OpenAI(api_key=api_key)

    async def transcribe(self, audio_path: str) -> str:
        loop = asyncio.get_event_loop()

        def _call():
            with open(audio_path, "rb") as f:
                return self.client.audio.transcriptions.create(
                    model="whisper-1", file=f, response_format="text"
                )

        result = await loop.run_in_executor(None, _call)
        return result.text


class MockSTT(STTService):
    """Fallback mock STT for testing without real models."""

    async def transcribe(self, audio_path: str) -> str:
        return "This is a mock transcription. Please configure STT service."


def get_stt_service(mode: str = "local") -> STTService:
    from ..config import settings

    if mode == "api":
        try:
            return OpenAIWhisperSTT(settings.openai_api_key)
        except RuntimeError:
            return MockSTT()
    try:
        return FasterWhisperSTT()
    except RuntimeError:
        return MockSTT()
