import os
import uuid
import time

from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException

from ..deps import get_current_user
from ..models import User
from ..services.stt_service import get_stt_service
from ..utils.audio import save_upload_to_temp, convert_webm_to_wav, cleanup_file

router = APIRouter(prefix="/transcribe", tags=["transcribe"])

ALLOWED_AUDIO_TYPES = {
    "audio/webm",
    "audio/ogg",
    "audio/wav",
    "audio/mpeg",
    "audio/mp4",
    "audio/x-wav",
    "audio/flac",
    "application/octet-stream",
}


@router.post("/")
async def transcribe_file(
    file: UploadFile = File(description="Audio file to transcribe"),
    stt_mode: str = Form(default="local"),
    language: str = Form(default="auto"),
    current_user: User = Depends(get_current_user),
):
    """Upload an audio file and get automatic transcription."""
    if file.content_type and file.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported audio type: {file.content_type}. "
            f"Supported: {', '.join(sorted(ALLOWED_AUDIO_TYPES))}",
        )

    audio_bytes = await file.read()
    if len(audio_bytes) == 0:
        raise HTTPException(status_code=422, detail="Empty audio file")
    if len(audio_bytes) > 100 * 1024 * 1024:  # 100MB for file uploads
        raise HTTPException(status_code=422, detail="File too large (max 100MB)")

    # Detect format
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
    elif "flac" in ct or fname.endswith(".flac"):
        ext = ".flac"

    tmp_path = save_upload_to_temp(audio_bytes, suffix=ext)
    wav_path = None

    try:
        if ext != ".wav":
            wav_path = convert_webm_to_wav(tmp_path)
            transcribe_path = wav_path
        else:
            transcribe_path = tmp_path

        stt = get_stt_service(stt_mode)
        start = time.time()
        transcript = await stt.transcribe(transcribe_path)
        elapsed = (time.time() - start) * 1000

        return {
            "transcript": transcript,
            "filename": file.filename,
            "language": language,
            "processing_time_ms": round(elapsed, 2),
            "file_size_bytes": len(audio_bytes),
        }

    finally:
        cleanup_file(tmp_path)
        if wav_path:
            cleanup_file(wav_path)
