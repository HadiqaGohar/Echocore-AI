import os
import uuid
import time
import logging

from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from ..database import get_session
from ..models import Conversation, Message
from ..models.analytics import UsageLog
from ..services.pipeline import run_pipeline
from ..services.llm_service import get_llm_service
from ..services.tts_service import get_tts_service
from ..utils.audio import save_upload_to_temp, convert_webm_to_wav, cleanup_file

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/voice", tags=["voice"])

ALLOWED_AUDIO_TYPES = {
    "audio/webm",
    "audio/ogg",
    "audio/wav",
    "audio/mpeg",
    "audio/mp4",
    "audio/x-wav",
    "application/octet-stream",
}

DEFAULT_USER_ID = 1

SYSTEM_PROMPT = (
    "You are EchoCore, a friendly and helpful voice AI assistant. "
    "Keep your responses concise and conversational. "
    "Always respond in the same language/script the user uses."
)


class TextChatRequest(BaseModel):
    text: str
    conversation_id: int | None = None
    llm_provider: str = "gemini"
    tts_mode: str = "edge"
    language: str = "en"
    voice_gender: str = "female"


@router.post("/process")
async def process_voice(
    file: UploadFile = File(description="Audio recording"),
    conversation_id: int | None = Form(default=None),
    stt_mode: str = Form(default="local"),
    llm_provider: str = Form(default="gemini"),
    tts_mode: str = Form(default="edge"),
    language: str = Form(default="en"),
    voice_gender: str = Form(default="female"),
    session: Session = Depends(get_session),
):
    if file.content_type and file.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(status_code=422, detail=f"Unsupported audio type: {file.content_type}")

    audio_bytes = await file.read()
    if len(audio_bytes) == 0:
        raise HTTPException(status_code=422, detail="Empty audio file")
    if len(audio_bytes) > 50 * 1024 * 1024:
        raise HTTPException(status_code=422, detail="File too large (max 50MB)")

    if conversation_id:
        conv = session.get(Conversation, conversation_id)
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conv = Conversation(title="New Conversation", user_id=DEFAULT_USER_ID)
        session.add(conv)
        session.commit()
        session.refresh(conv)

    ext = ".webm"
    ct = (file.content_type or "").lower()
    fname = (file.filename or "").lower()
    if "wav" in ct or fname.endswith(".wav"):
        ext = ".wav"
    elif "ogg" in ct or fname.endswith(".ogg"):
        ext = ".ogg"
    elif "mpeg" in ct or fname.endswith(".mp3"):
        ext = ".mp3"
    elif "mp4" in ct or fname.endswith(".m4a"):
        ext = ".m4a"

    tmp_path = save_upload_to_temp(audio_bytes, suffix=ext)
    start_time = time.time()
    wav_path = None

    try:
        try:
            if ext != ".wav":
                wav_path = convert_webm_to_wav(tmp_path)
            else:
                wav_path = tmp_path
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Audio conversion failed: {str(e)}")

        history_msgs = session.exec(
            select(Message)
            .where(Message.conversation_id == conv.id)
            .order_by(Message.created_at)
        ).all()
        history = [{"role": m.role, "content": m.content} for m in history_msgs]

        try:
            result = await run_pipeline(
                wav_path,
                conversation_history=history,
                stt_mode=stt_mode,
                llm_provider=llm_provider,
                tts_mode=tts_mode,
                language=language,
                voice_gender=voice_gender,
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")

        user_msg = Message(conversation_id=conv.id, role="user", content=result["transcript"])
        session.add(user_msg)

        content_type_to_ext = {"audio/ogg": ".ogg", "audio/wav": ".wav", "audio/mpeg": ".mp3", "audio/mp4": ".m4a"}
        audio_ext = content_type_to_ext.get(result["audio_content_type"], ".ogg")
        audio_filename = f"{uuid.uuid4().hex}{audio_ext}"
        audio_dir = os.path.join(os.path.dirname(__file__), "..", "..", "audio")
        os.makedirs(audio_dir, exist_ok=True)
        audio_path = os.path.join(audio_dir, audio_filename)
        with open(audio_path, "wb") as f:
            f.write(result["audio_bytes"])

        ai_msg = Message(conversation_id=conv.id, role="assistant", content=result["reply"], audio_url=f"/audio/{audio_filename}")
        session.add(ai_msg)

        if conv.title == "New Conversation":
            conv.title = result["transcript"][:80]

        session.commit()
        session.refresh(ai_msg)

        # Log analytics
        try:
            elapsed_ms = (time.time() - start_time) * 1000
            log = UsageLog(
                user_id=DEFAULT_USER_ID, interaction_type="voice", language=language,
                voice_gender=voice_gender, stt_mode=stt_mode, tts_mode=tts_mode,
                llm_provider=llm_provider, transcript_length=len(result["transcript"]),
                reply_length=len(result["reply"]), processing_time_ms=round(elapsed_ms, 2), had_audio=True,
            )
            session.add(log)
            session.commit()
        except Exception:
            pass

        return {
            "transcript": result["transcript"],
            "reply": result["reply"],
            "audio_url": f"/audio/{audio_filename}",
            "conversation_id": conv.id,
            "message_id": ai_msg.id,
            "detected_language": result.get("detected_language", language),
        }
    finally:
        cleanup_file(tmp_path)
        if ext != ".wav":
            cleanup_file(wav_path)


@router.post("/text")
async def process_text(
    request: TextChatRequest,
    session: Session = Depends(get_session),
):
    """Process text input directly (no STT needed). Accepts JSON body."""
    actual_text = request.text.strip() if request.text else ""
    if not actual_text:
        raise HTTPException(status_code=422, detail="Text cannot be empty")

    start_time = time.time()

    try:
        if request.conversation_id:
            conv = session.get(Conversation, request.conversation_id)
            if not conv:
                raise HTTPException(status_code=404, detail="Conversation not found")
        else:
            conv = Conversation(title=actual_text[:80], user_id=DEFAULT_USER_ID)
            session.add(conv)
            session.commit()
            session.refresh(conv)

        # Get history
        history_msgs = session.exec(
            select(Message).where(Message.conversation_id == conv.id).order_by(Message.created_at)
        ).all()
        history = [{"role": m.role, "content": m.content} for m in history_msgs]

        # LLM
        logger.info(f"Text chat: provider={request.llm_provider}, text_len={len(actual_text)}")
        llm = get_llm_service(request.llm_provider)
        messages = history + [{"role": "user", "content": actual_text}]
        reply = await llm.chat(messages, system_prompt=SYSTEM_PROMPT)
        logger.info(f"LLM reply: {reply[:100]}...")

        # TTS
        tts = get_tts_service(request.tts_mode)
        audio_bytes, audio_content_type = await tts.synthesize(reply, language=request.language, voice_gender=request.voice_gender)

        # Save
        user_msg = Message(conversation_id=conv.id, role="user", content=actual_text)
        session.add(user_msg)

        content_type_to_ext = {"audio/ogg": ".ogg", "audio/wav": ".wav", "audio/mpeg": ".mp3"}
        audio_ext = content_type_to_ext.get(audio_content_type, ".mp3")
        audio_filename = f"{uuid.uuid4().hex}{audio_ext}"
        audio_dir = os.path.join(os.path.dirname(__file__), "..", "..", "audio")
        os.makedirs(audio_dir, exist_ok=True)
        with open(os.path.join(audio_dir, audio_filename), "wb") as f:
            f.write(audio_bytes)

        ai_msg = Message(conversation_id=conv.id, role="assistant", content=reply, audio_url=f"/audio/{audio_filename}")
        session.add(ai_msg)

        if conv.title == "New Conversation":
            conv.title = actual_text[:80]

        session.commit()
        session.refresh(ai_msg)

        # Log
        try:
            elapsed_ms = (time.time() - start_time) * 1000
            log = UsageLog(
                user_id=DEFAULT_USER_ID, interaction_type="text", language=request.language,
                voice_gender=request.voice_gender, stt_mode="text", tts_mode=request.tts_mode,
                llm_provider=request.llm_provider, transcript_length=len(actual_text),
                reply_length=len(reply), processing_time_ms=round(elapsed_ms, 2), had_audio=True,
            )
            session.add(log)
            session.commit()
        except Exception:
            pass

        return {
            "transcript": actual_text,
            "reply": reply,
            "audio_url": f"/audio/{audio_filename}",
            "conversation_id": conv.id,
            "message_id": ai_msg.id,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Text chat error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")


@router.post("/chat")
async def chat_text(
    request: TextChatRequest,
    session: Session = Depends(get_session),
):
    """Chat with text input. Used by browser STT flow - text already transcribed in browser."""
    return await process_text(request, session)
