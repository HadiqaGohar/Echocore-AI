import os
import uuid
import time

from fastapi import APIRouter, Form, HTTPException
from fastapi.responses import Response
from sqlmodel import Session

from ..database import get_session
from ..models.analytics import TTSRequest
from ..services.tts_service import get_tts_service
from ..services.edge_tts_service import EdgeTTSService

router = APIRouter(prefix="/tts", tags=["tts"])

DEFAULT_USER_ID = 1


@router.post("/convert")
async def convert_tts(
    text: str = Form(...),
    language: str = Form(default="en"),
    voice_gender: str = Form(default="female"),
    tts_mode: str = Form(default="edge"),
):
    """Convert text to speech and return audio bytes."""
    if not text.strip():
        raise HTTPException(status_code=422, detail="Text cannot be empty")
    if len(text) > 5000:
        raise HTTPException(status_code=422, detail="Text too long (max 5000 chars)")

    tts = get_tts_service(tts_mode)
    start = time.time()
    audio_bytes, content_type = await tts.synthesize(
        text, language=language, voice_gender=voice_gender
    )
    elapsed = (time.time() - start) * 1000

    # Log the request
    try:
        from ..database import engine
        with Session(engine) as session:
            log = TTSRequest(
                user_id=DEFAULT_USER_ID,
                text=text[:500],
                language=language,
                voice_gender=voice_gender,
                tts_mode=tts_mode,
                text_length=len(text),
            )
            session.add(log)
            session.commit()
    except Exception:
        pass

    return Response(
        content=audio_bytes,
        media_type=content_type,
        headers={
            "Content-Disposition": f'attachment; filename="echocore_tts_{uuid.uuid4().hex[:8]}.mp3"',
            "X-Processing-Time-Ms": str(int(elapsed)),
        },
    )


@router.post("/download")
async def download_tts(
    text: str = Form(...),
    language: str = Form(default="en"),
    voice_gender: str = Form(default="female"),
    tts_mode: str = Form(default="edge"),
):
    """Convert text to speech and return as downloadable file."""
    return await convert_tts(text=text, language=language, voice_gender=voice_gender, tts_mode=tts_mode)


@router.get("/voices")
async def list_voices(language: str = ""):
    """List available TTS voices."""
    voices = await EdgeTTSService.list_voices(language)
    return {"voices": voices}
