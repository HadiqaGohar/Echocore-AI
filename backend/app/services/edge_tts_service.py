import asyncio
import edge_tts


class EdgeTTSService:
    """Free, unlimited TTS via Microsoft Edge voices.
    
    Hindi: hi-IN-MadhurNeural (male), hi-IN-SwaraNeural (female)
    Urdu:  ur-PK-AsadNeural (male), ur-PK-UzmaNeural (female)
    English: en-US-AvaNeural (female), en-US-AndrewNeural (male)
    """

    VOICE_MAP = {
        # Hindi
        ("hi", "male"): "hi-IN-MadhurNeural",
        ("hi", "female"): "hi-IN-SwaraNeural",
        # Urdu
        ("ur", "male"): "ur-PK-AsadNeural",
        ("ur", "female"): "ur-PK-UzmaNeural",
        # English
        ("en", "male"): "en-US-AndrewNeural",
        ("en", "female"): "en-US-AvaNeural",
        # Pashto
        ("ps", "male"): "ps-AF-DaulatNeural",
        ("ps", "female"): "ps-AF-LatifaNeural",
        # Arabic
        ("ar", "male"): "ar-SA-HamedNeural",
        ("ar", "female"): "ar-SA-ZariyahNeural",
        # Bangla
        ("bn", "male"): "bn-BD-PradeepNeural",
        ("bn", "female"): "bn-BD-NabanitaNeural",
        # Turkish
        ("tr", "male"): "tr-TR-AhmetNeural",
        ("tr", "female"): "tr-TR-EmelNeural",
        # French
        ("fr", "male"): "fr-FR-HenriNeural",
        ("fr", "female"): "fr-FR-DeniseNeural",
        # German
        ("de", "male"): "de-DE-ConradNeural",
        ("de", "female"): "de-DE-KatjaNeural",
        # Spanish
        ("es", "male"): "es-ES-ElviraNeural",
        ("es", "female"): "es-ES-AlvaroNeural",
    }

    def __init__(self):
        pass

    async def synthesize(
        self, text: str, language: str = "en", voice_gender: str = "female"
    ) -> tuple[bytes, str]:
        """Synthesize text to audio bytes."""
        voice = self.VOICE_MAP.get((language, voice_gender), "en-US-AvaNeural")

        communicate = edge_tts.Communicate(text, voice)
        audio_data = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data += chunk["data"]

        return audio_data, "audio/mpeg"

    @staticmethod
    async def list_voices(language: str = "") -> list[dict]:
        """List available voices, optionally filtered by language."""
        voices = await edge_tts.list_voices()
        if language:
            voices = [v for v in voices if v["Locale"].startswith(language)]
        return [
            {
                "id": v["ShortName"],
                "name": v["FriendlyName"],
                "language": v["Locale"],
                "gender": v["Gender"],
            }
            for v in voices
        ]
