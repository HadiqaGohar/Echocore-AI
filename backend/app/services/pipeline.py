import asyncio
from ..services.stt_service import get_stt_service
from ..services.llm_service import get_llm_service
from ..services.tts_service import get_tts_service

SYSTEM_PROMPT = (
    "You are EchoCore, a friendly and helpful voice AI assistant. "
    "Keep your responses concise and conversational since they will be "
    "spoken aloud. Avoid markdown formatting, bullet points, or "
    "anything that doesn't translate well to speech. Be warm and natural."
)


async def run_pipeline(
    audio_path: str,
    conversation_history: list[dict] | None = None,
    stt_mode: str = "local",
    llm_provider: str = "gemini",
    tts_mode: str = "local",
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
    messages = []
    if conversation_history:
        messages.extend(conversation_history)
    messages.append({"role": "user", "content": transcript})

    reply = await llm.chat(messages, system_prompt=SYSTEM_PROMPT)

    # Step 3: Text to Speech
    audio_bytes, audio_content_type = await tts.synthesize(reply)

    return {
        "transcript": transcript,
        "reply": reply,
        "audio_bytes": audio_bytes,
        "audio_content_type": audio_content_type,
    }
