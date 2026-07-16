import asyncio
from concurrent.futures import ThreadPoolExecutor


class TTSService:
    async def synthesize(self, text: str, language: str = "en", voice_gender: str = "female") -> tuple[bytes, str]:
        """Returns (audio_bytes, content_type)."""
        raise NotImplementedError


class EdgeTTS(TTSService):
    """Free unlimited TTS via Microsoft Edge voices.
    
    Supports: Hindi (MadhurNeural), Urdu, English, Pashto, Arabic, Bangla, etc.
    """

    async def synthesize(self, text: str, language: str = "en", voice_gender: str = "female") -> tuple[bytes, str]:
        from .edge_tts_service import EdgeTTSService

        service = EdgeTTSService()
        return await service.synthesize(text, language, voice_gender)


class Pyttsx3TTS(TTSService):
    """Local TTS using pyttsx3. Outputs WAV. Free but robotic quality."""

    def __init__(self):
        try:
            import pyttsx3  # noqa: F401
        except ImportError:
            raise RuntimeError("pyttsx3 not installed. Run: pip install pyttsx3")
        self.executor = ThreadPoolExecutor(max_workers=2)

    async def synthesize(self, text: str, language: str = "en", voice_gender: str = "female") -> tuple[bytes, str]:
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
    """Cloud TTS using OpenAI TTS API. PAID."""

    def __init__(self, api_key: str, voice: str = "nova"):
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY not set")
        from openai import OpenAI

        self.client = OpenAI(api_key=api_key)
        self.voice = voice

    async def synthesize(self, text: str, language: str = "en", voice_gender: str = "female") -> tuple[bytes, str]:
        loop = asyncio.get_event_loop()

        def _call():
            return self.client.audio.speech.create(
                model="tts-1",
                voice=self.voice,
                input=text,
                response_format="opus",
            )

        response = await loop.run_in_executor(None, _call)
        return response.content, "audio/ogg"


class ElevenLabsTTS(TTSService):
    """Cloud TTS using ElevenLabs. PAID."""

    def __init__(self, api_key: str):
        if not api_key:
            raise RuntimeError("ELEVENLABS_API_KEY not set")
        from elevenlabs.client import ElevenLabs

        self.client = ElevenLabs(api_key=api_key)

    async def synthesize(self, text: str, language: str = "en", voice_gender: str = "female") -> tuple[bytes, str]:
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


class MockTTS(TTSService):
    """Fallback mock TTS - returns a short silent WAV."""

    async def synthesize(self, text: str, language: str = "en", voice_gender: str = "female") -> tuple[bytes, str]:
        import wave, struct, io

        sample_rate = 16000
        duration = 1
        num_samples = sample_rate * duration

        buf = io.BytesIO()
        with wave.open(buf, "w") as wav:
            wav.setnchannels(1)
            wav.setsampwidth(2)
            wav.setframerate(sample_rate)
            for _ in range(num_samples):
                wav.writeframes(struct.pack("<h", 0))
        return buf.getvalue(), "audio/wav"


def get_tts_service(mode: str = "edge") -> TTSService:
    """Get TTS service. Default is 'edge' (free, unlimited)."""
    from ..config import settings

    try:
        if mode == "openai":
            return OpenAITTS(settings.openai_api_key, settings.tts_voice)
        if mode == "elevenlabs":
            return ElevenLabsTTS(settings.elevenlabs_api_key)
        if mode == "pyttsx3":
            return Pyttsx3TTS()
        # Default: edge-tts (free, unlimited, multilingual)
        return EdgeTTS()
    except RuntimeError:
        return MockTTS()
