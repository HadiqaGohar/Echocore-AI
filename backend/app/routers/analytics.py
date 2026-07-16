from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from datetime import datetime, timedelta, timezone

from ..database import get_session
from ..deps import get_current_user
from ..models import User
from ..models.analytics import UsageLog, TTSRequest
from ..models.conversation import Conversation, Message

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard")
async def get_dashboard(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Get analytics dashboard data for current user."""
    uid = current_user.id
    now = datetime.now(timezone.utc)
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)

    total_conversations = session.exec(
        select(func.count(Conversation.id)).where(Conversation.user_id == uid)
    ).one()

    total_messages = session.exec(
        select(func.count(Message.id)).where(
            Message.conversation_id.in_(
                select(Conversation.id).where(Conversation.user_id == uid)
            )
        )
    ).one()

    conversations_today = session.exec(
        select(func.count(Conversation.id)).where(
            Conversation.user_id == uid,
            Conversation.created_at >= today,
        )
    ).one()

    messages_today = session.exec(
        select(func.count(Message.id)).where(
            Message.conversation_id.in_(
                select(Conversation.id).where(
                    Conversation.user_id == uid,
                    Conversation.created_at >= today,
                )
            )
        )
    ).one()

    language_stats = {}
    logs = session.exec(select(UsageLog).where(UsageLog.user_id == uid)).all()
    for log in logs:
        lang = log.language
        if lang not in language_stats:
            language_stats[lang] = {"count": 0, "type_counts": {}}
        language_stats[lang]["count"] += 1
        t = log.interaction_type
        language_stats[lang]["type_counts"][t] = language_stats[lang]["type_counts"].get(t, 0) + 1

    interaction_stats = {}
    for log in logs:
        t = log.interaction_type
        interaction_stats[t] = interaction_stats.get(t, 0) + 1

    tts_requests = session.exec(
        select(func.count(TTSRequest.id)).where(TTSRequest.user_id == uid)
    ).one()

    daily_activity = []
    for i in range(7):
        day = today - timedelta(days=6 - i)
        next_day = day + timedelta(days=1)
        count = session.exec(
            select(func.count(Message.id)).where(
                Message.conversation_id.in_(
                    select(Conversation.id).where(
                        Conversation.user_id == uid,
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
    current_user: User = Depends(get_current_user),
):
    """Log an interaction for analytics."""
    log = UsageLog(
        user_id=current_user.id,
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
