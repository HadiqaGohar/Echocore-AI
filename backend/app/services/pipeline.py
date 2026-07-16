from ..services.stt_service import get_stt_service
from ..services.llm_service import get_llm_service
from ..services.tts_service import get_tts_service

SYSTEM_PROMPT = (
    "You are EchoCore, a friendly and helpful voice AI assistant. "
    "Keep your responses concise and conversational since they will be "
    "spoken aloud. Avoid markdown formatting, bullet points, or "
    "anything that doesn't translate well to speech. Be warm and natural. "
    "Always respond in the same language the user speaks."
)

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "ur": "Urdu",
    "ps": "Pashto",
    "ar": "Arabic",
    "bn": "Bengali",
    "tr": "Turkish",
    "fr": "French",
    "de": "German",
    "es": "Spanish",
}


async def run_pipeline(
    audio_path: str,
    conversation_history: list[dict] | None = None,
    stt_mode: str = "local",
    llm_provider: str = "gemini",
    tts_mode: str = "edge",
    language: str = "en",
    voice_gender: str = "female",
) -> dict:
    """Run the full STT -> LLM -> TTS pipeline.

    Returns dict with: transcript, reply, audio_bytes, audio_content_type
    """
    stt = get_stt_service(stt_mode)
    llm = get_llm_service(llm_provider)
    tts = get_tts_service(tts_mode)

    # Step 1: Speech to Text
    transcript = await stt.transcribe(audio_path)

    # Step 2: LLM generates reply
    lang_name = LANGUAGE_NAMES.get(language, "English")
    lang_instruction = f"The user is speaking in {lang_name}. Respond in {lang_name}."

    messages = []
    if conversation_history:
        messages.extend(conversation_history)
    messages.append({"role": "user", "content": transcript})

    reply = await llm.chat(messages, system_prompt=f"{SYSTEM_PROMPT}\n\n{lang_instruction}")

    # Step 3: Text to Speech with language support
    audio_bytes, audio_content_type = await tts.synthesize(
        reply, language=language, voice_gender=voice_gender
    )

    return {
        "transcript": transcript,
        "reply": reply,
        "audio_bytes": audio_bytes,
        "audio_content_type": audio_content_type,
    }
