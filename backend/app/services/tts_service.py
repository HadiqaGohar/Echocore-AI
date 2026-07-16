import asyncio
from concurrent.futures import ThreadPoolExecutor

from ..config import settings


class TTSService:
    async def synthesize(self, text: str) -> tuple[bytes, str]:
        """Returns (audio_bytes, content_type)."""
        raise NotImplementedError


class Pyttsx3TTS(TTSService):
    """Local TTS using pyttsx3. Outputs WAV."""

    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=2)

    async def synthesize(self, text: str) -> tuple[bytes, str]:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(self.executor, self._generate, text)

        with open("/tmp/echocore_tts.wav", "rb") as f:
            audio_bytes = f.read()
        return audio_bytes, "audio/wav"

    def _generate(self, text: str):
        import pyttsx3

        engine = pyttsx3.init()
        engine.setProperty("rate", 150)
        engine.setProperty("volume", 0.9)
        engine.save_to_file(text, "/tmp/echocore_tts.wav")
        engine.runAndWait()


class OpenAITTS(TTSService):
    """Cloud TTS using OpenAI TTS API."""

    def __init__(self):
        from openai import OpenAI

        self.client = OpenAI(api_key=settings.openai_api_key)

    async def synthesize(self, text: str) -> tuple[bytes, str]:
        loop = asyncio.get_event_loop()

        def _call():
            return self.client.audio.speech.create(
                model="tts-1",
                voice=settings.tts_voice or "nova",
                input=text,
                response_format="opus",
            )

        response = await loop.run_in_executor(None, _call)
        return response.content, "audio/ogg"


class ElevenLabsTTS(TTSService):
    """Cloud TTS using ElevenLabs."""

    def __init__(self):
        from elevenlabs.client import ElevenLabs

        self.client = ElevenLabs(api_key=settings.elevenlabs_api_key)

    async def synthesize(self, text: str) -> tuple[bytes, str]:
        loop = asyncio.get_event_loop()

        def _call():
            audio_stream = self.client.text_to_speech.convert(
                voice_id="21m00Tcm4TlvDq8ikWAM",
                text=text,
                model_id="eleven_turbo_v2",
            )
            return b"".join(audio_stream)

        audio_bytes = await loop.run_in_executor(None, _call)
        return audio_bytes, "audio/mpeg"


def get_tts_service() -> TTSService:
    mode = settings.tts_mode.lower()
    if mode == "openai":
        return OpenAITTS()
    if mode == "elevenlabs":
        return ElevenLabsTTS()
    return Pyttsx3TTS()
