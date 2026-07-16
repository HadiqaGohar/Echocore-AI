from datetime import datetime

from sqlmodel import SQLModel, Field


class UsageLog(SQLModel, table=True):
    """Track every voice/text interaction for analytics."""
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(default=1, index=True)
    interaction_type: str  # "voice" | "text" | "file_upload" | "tts_convert"
    language: str = "en"
    voice_gender: str = "female"
    stt_mode: str = "local"
    tts_mode: str = "edge"
    llm_provider: str = "gemini"
    transcript_length: int = 0
    reply_length: int = 0
    processing_time_ms: float = 0
    had_audio: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TTSRequest(SQLModel, table=True):
    """Track TTS conversion requests."""
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(default=1, index=True)
    text: str
    language: str = "en"
    voice_gender: str = "female"
    tts_mode: str = "edge"
    text_length: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
