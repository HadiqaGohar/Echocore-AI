import re

from ..services.stt_service import get_stt_service
from ..services.llm_service import get_llm_service
from ..services.tts_service import get_tts_service

SYSTEM_PROMPT = """You are EchoCore, a friendly and helpful voice AI assistant.
Keep your responses concise and conversational since they will be spoken aloud.
Avoid markdown formatting, bullet points, or anything that doesn't translate well to speech.
Be warm and natural.

CRITICAL LANGUAGE RULES:
1. If the user writes in Hindi script (Devanagari: हिन्दी), respond in Hindi script.
2. If the user writes in Urdu script (Nastaliq: اردو), respond in Urdu script.
3. If the user writes in Roman Urdu (English letters but Urdu words like "kya hai", "kaise ho", "theek hai", "bohot acha"), detect it as Roman Urdu and respond in Roman Urdu.
4. If the user writes in English, respond in English.
5. NEVER confuse Roman Urdu with English. Roman Urdu uses English script but contains Urdu vocabulary.
6. Keep the same script the user uses - if they type in Roman Urdu, you respond in Roman Urdu."""

ROMAN_URDU_INDICATORS = [
    r"\bkya\b", r"\bhai\b", r"\bho\b", r"\btha\b", r"\bthi\b",
    r"\bmein\b", r"\btum\b", r"\baap\b", r"\bhum\b", r"\bwoh\b",
    r"\byeh\b", r"\bse\b", r"\bko\b", r"\bka\b", r"\bki\b",
    r"\bke\b", r"\bna\b", r"\bji\b", r"\bsahab\b", r"\bbhai\b",
    r"\bbahut\b", r"\bbohot\b", r"\bacha\b", r"\btheek\b",
    r"\bkaise\b", r"\bkar\b", r"\bkarne\b", r"\bkaro\b",
    r"\bjee\b", r"\bshukriya\b", r"\bmaaf\b", r"\bproblem\b",
    r"\bchalo\b", r"\baao\b", r"\bchahiye\b", r"\bde\b",
    r"\blekin\b", r"\bphir\b", r"\bab\b", r"\byahan\b",
    r"\bwahan\b", r"\bkal\b", r"\baaj\b", r"\bghar\b",
    r"\bpani\b", r"\bkhana\b", r"\bsoch\b", r"\bsamajh\b",
]

ROMAN_URDU_PATTERN = re.compile(
    "|".join(ROMAN_URDU_INDICATORS), re.IGNORECASE
)

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "ur": "Urdu",
    "ur-roman": "Roman Urdu",
    "ps": "Pashto",
    "ar": "Arabic",
    "bn": "Bengali",
    "tr": "Turkish",
    "fr": "French",
    "de": "German",
    "es": "Spanish",
}


def detect_roman_urdu(text: str) -> bool:
    """Detect if text is written in Roman Urdu (English script, Urdu words)."""
    matches = ROMAN_URDU_PATTERN.findall(text)
    words = text.split()
    if not words:
        return False
    ratio = len(matches) / len(words)
    return ratio > 0.15 and len(matches) >= 2


async def transliterate_roman_urdu_to_urdu(text: str, llm) -> str:
    """Use LLM to transliterate Roman Urdu to Urdu script."""
    prompt = (
        "Transliterate the following Roman Urdu text to Urdu script (Nastaliq). "
        "Return ONLY the Urdu script translation, nothing else.\n\n"
        f"Roman Urdu: {text}\n\nUrdu script:"
    )
    result = await llm.chat(
        [{"role": "user", "content": prompt}],
        system_prompt="You are a transliteration assistant. Convert Roman Urdu to Urdu script. Return only the Urdu text."
    )
    return result.strip()


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

    Returns dict with: transcript, reply, audio_bytes, audio_content_type, detected_language
    """
    stt = get_stt_service(stt_mode)
    llm = get_llm_service(llm_provider)
    tts = get_tts_service(tts_mode)

    # Step 1: Speech to Text
    transcript = await stt.transcribe(audio_path)

    # Step 2: Detect if Roman Urdu
    is_roman_urdu = detect_roman_urdu(transcript)
    effective_language = "ur-roman" if is_roman_urdu else language

    # Step 3: LLM generates reply
    lang_name = LANGUAGE_NAMES.get(effective_language, "English")
    lang_instruction = f"The user is speaking/writing in {lang_name}. Respond in {lang_name}."

    if is_roman_urdu:
        lang_instruction += (
            " The user is writing in Roman Urdu (English script with Urdu words). "
            "You MUST respond in Roman Urdu using English letters, NOT in Urdu script. "
            "For example: 'Acha main samajh gaya' NOT 'اچھا میں سمجھ گیا'."
        )

    messages = []
    if conversation_history:
        messages.extend(conversation_history)
    messages.append({"role": "user", "content": transcript})

    reply = await llm.chat(messages, system_prompt=f"{SYSTEM_PROMPT}\n\n{lang_instruction}")

    # Step 4: For TTS - if Roman Urdu, transliterate to Urdu script for proper pronunciation
    tts_text = reply
    tts_language = language

    if is_roman_urdu:
        # Transliterate Roman Urdu reply to Urdu script for TTS engine
        try:
            tts_text = await transliterate_roman_urdu_to_urdu(reply, llm)
            tts_language = "ur"  # Use Urdu voice for proper pronunciation
        except Exception:
            # Fallback: use English voice with Roman Urdu text
            tts_text = reply
            tts_language = "en"

    # Step 5: Text to Speech with language support
    audio_bytes, audio_content_type = await tts.synthesize(
        tts_text, language=tts_language, voice_gender=voice_gender
    )

    return {
        "transcript": transcript,
        "reply": reply,  # Original Roman Urdu reply for frontend display
        "audio_bytes": audio_bytes,
        "audio_content_type": audio_content_type,
        "detected_language": effective_language,
    }
