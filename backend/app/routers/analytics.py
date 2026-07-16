from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from datetime import datetime, timedelta

from ..database import get_session
from ..models.analytics import UsageLog, TTSRequest
from ..models.conversation import Conversation, Message

router = APIRouter(prefix="/analytics", tags=["analytics"])

DEFAULT_USER_ID = 1


@router.get("/dashboard")
async def get_dashboard(session: Session = Depends(get_session)):
    """Get analytics dashboard data."""
    now = datetime.utcnow()
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)

    # Total conversations
    total_conversations = session.exec(
        select(func.count(Conversation.id)).where(Conversation.user_id == DEFAULT_USER_ID)
    ).one()

    # Total messages
    total_messages = session.exec(
        select(func.count(Message.id)).where(
            Message.conversation_id.in_(
                select(Conversation.id).where(Conversation.user_id == DEFAULT_USER_ID)
            )
        )
    ).one()

    # Conversations today
    conversations_today = session.exec(
        select(func.count(Conversation.id)).where(
            Conversation.user_id == DEFAULT_USER_ID,
            Conversation.created_at >= today,
        )
    ).one()

    # Messages today
    messages_today = session.exec(
        select(func.count(Message.id)).where(
            Message.conversation_id.in_(
                select(Conversation.id).where(
                    Conversation.user_id == DEFAULT_USER_ID,
                    Conversation.created_at >= today,
                )
            )
        )
    ).one()

    # Language usage breakdown
    language_stats = {}
    logs = session.exec(select(UsageLog).where(UsageLog.user_id == DEFAULT_USER_ID)).all()
    for log in logs:
        lang = log.language
        if lang not in language_stats:
            language_stats[lang] = {"count": 0, "type_counts": {}}
        language_stats[lang]["count"] += 1
        t = log.interaction_type
        language_stats[lang]["type_counts"][t] = language_stats[lang]["type_counts"].get(t, 0) + 1

    # Interaction type breakdown
    interaction_stats = {}
    for log in logs:
        t = log.interaction_type
        interaction_stats[t] = interaction_stats.get(t, 0) + 1

    # TTS usage
    tts_requests = session.exec(
        select(func.count(TTSRequest.id)).where(TTSRequest.user_id == DEFAULT_USER_ID)
    ).one()

    # Recent activity (last 7 days)
    daily_activity = []
    for i in range(7):
        day = today - timedelta(days=6 - i)
        next_day = day + timedelta(days=1)
        count = session.exec(
            select(func.count(Message.id)).where(
                Message.conversation_id.in_(
                    select(Conversation.id).where(
                        Conversation.user_id == DEFAULT_USER_ID,
                        Conversation.created_at >= day,
                        Conversation.created_at < next_day,
                    )
                )
            )
        ).one()
        daily_activity.append({
            "date": day.strftime("%Y-%m-%d"),
            "label": day.strftime("%a"),
            "messages": count,
        })

    # Voice gender stats
    gender_stats = {}
    for log in logs:
        g = log.voice_gender
        gender_stats[g] = gender_stats.get(g, 0) + 1

    return {
        "total_conversations": total_conversations,
        "total_messages": total_messages,
        "conversations_today": conversations_today,
        "messages_today": messages_today,
        "total_tts_requests": tts_requests,
        "language_stats": language_stats,
        "interaction_stats": interaction_stats,
        "daily_activity": daily_activity,
        "gender_stats": gender_stats,
    }


@router.post("/log")
async def log_interaction(
    interaction_type: str = "voice",
    language: str = "en",
    voice_gender: str = "female",
    stt_mode: str = "local",
    tts_mode: str = "edge",
    llm_provider: str = "gemini",
    transcript_length: int = 0,
    reply_length: int = 0,
    processing_time_ms: float = 0,
    had_audio: bool = True,
    session: Session = Depends(get_session),
):
    """Log an interaction for analytics."""
    log = UsageLog(
        user_id=DEFAULT_USER_ID,
        interaction_type=interaction_type,
        language=language,
        voice_gender=voice_gender,
        stt_mode=stt_mode,
        tts_mode=tts_mode,
        llm_provider=llm_provider,
        transcript_length=transcript_length,
        reply_length=reply_length,
        processing_time_ms=processing_time_ms,
        had_audio=had_audio,
    )
    session.add(log)
    session.commit()
    return {"status": "ok"}
