import os
import uuid

from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from fastapi.responses import Response
from sqlmodel import Session, select

from ..database import get_session
from ..models import Conversation, Message
from ..services.pipeline import run_pipeline
from ..utils.audio import save_upload_to_temp, convert_webm_to_wav, cleanup_file
from ..config import settings

router = APIRouter(prefix="/voice", tags=["voice"])

ALLOWED_AUDIO_TYPES = {
    "audio/webm",
    "audio/ogg",
    "audio/wav",
    "audio/mpeg",
    "audio/mp4",
    "audio/x-wav",
}


@router.post("/process")
async def process_voice(
    file: UploadFile = File(description="Audio recording"),
    conversation_id: int | None = Form(default=None),
    stt_mode: str = Form(default="local"),
    llm_provider: str = Form(default="gemini"),
    tts_mode: str = Form(default="local"),
    session: Session = Depends(get_session),
):
    # Validate audio type
    if file.content_type and file.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported audio type: {file.content_type}",
        )

    # Read uploaded audio
    audio_bytes = await file.read()
    if len(audio_bytes) == 0:
        raise HTTPException(status_code=422, detail="Empty audio file")
    if len(audio_bytes) > 50 * 1024 * 1024:
        raise HTTPException(status_code=422, detail="File too large (max 50MB)")

    # Create or get conversation
    if conversation_id:
        conv = session.get(Conversation, conversation_id)
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conv = Conversation(title="New Conversation", user_id=1)
        session.add(conv)
        session.commit()
        session.refresh(conv)

    # Save audio to temp file
    ext = ".webm"
    if file.content_type and "wav" in file.content_type:
        ext = ".wav"
    elif file.content_type and "ogg" in file.content_type:
        ext = ".ogg"
    elif file.content_type and "mpeg" in file.content_type:
        ext = ".mp3"

    tmp_path = save_upload_to_temp(audio_bytes, suffix=ext)

    try:
        # Convert to WAV if needed (faster-whisper works best with WAV)
        if ext != ".wav":
            wav_path = convert_webm_to_wav(tmp_path)
        else:
            wav_path = tmp_path

        # Get conversation history for context
        history_msgs = session.exec(
            select(Message)
            .where(Message.conversation_id == conv.id)
            .order_by(Message.created_at)
        ).all()
        history = [{"role": m.role, "content": m.content} for m in history_msgs]

        # Override settings for this request
        original_stt = settings.stt_mode
        original_llm = settings.llm_provider
        original_tts = settings.tts_mode
        settings.stt_mode = stt_mode
        settings.llm_provider = llm_provider
        settings.tts_mode = tts_mode

        try:
            result = await run_pipeline(wav_path, conversation_history=history)
        finally:
            settings.stt_mode = original_stt
            settings.llm_provider = original_llm
            settings.tts_mode = original_tts

        # Save user message
        user_msg = Message(
            conversation_id=conv.id,
            role="user",
            content=result["transcript"],
        )
        session.add(user_msg)

        # Save AI reply
        audio_filename = f"{uuid.uuid4().hex}.ogg"
        audio_dir = os.path.join(os.path.dirname(__file__), "..", "..", "audio")
        os.makedirs(audio_dir, exist_ok=True)
        audio_path = os.path.join(audio_dir, audio_filename)
        with open(audio_path, "wb") as f:
            f.write(result["audio_bytes"])

        ai_msg = Message(
            conversation_id=conv.id,
            role="assistant",
            content=result["reply"],
            audio_url=f"/audio/{audio_filename}",
        )
        session.add(ai_msg)

        # Update conversation title from first user message
        if conv.title == "New Conversation":
            conv.title = result["transcript"][:80]

        session.commit()
        session.refresh(ai_msg)

        return {
            "transcript": result["transcript"],
            "reply": result["reply"],
            "audio_url": f"/audio/{audio_filename}",
            "conversation_id": conv.id,
            "message_id": ai_msg.id,
        }

    finally:
        cleanup_file(tmp_path)
        if ext != ".wav":
            cleanup_file(wav_path)
