from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..database import get_session
from ..deps import get_current_user
from ..models import User, Conversation, Message
from ..schemas import ConversationPublic, MessagePublic, ConversationCreate

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("/", response_model=list[ConversationPublic])
def list_conversations(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    offset: int = 0,
    limit: int = 50,
):
    return session.exec(
        select(Conversation)
        .where(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()


@router.post("/", response_model=ConversationPublic)
def create_conversation(
    data: ConversationCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    conv = Conversation(title=data.title, user_id=current_user.id)
    session.add(conv)
    session.commit()
    session.refresh(conv)
    return conv


@router.get("/shared/{share_id}")
def get_shared_conversation(
    share_id: str,
    session: Session = Depends(get_session),
):
    """Get a shared conversation by share_id (public, no auth required)."""
    conv = session.exec(
        select(Conversation).where(Conversation.share_id == share_id)
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = session.exec(
        select(Message)
        .where(Message.conversation_id == conv.id)
        .order_by(Message.created_at)
    ).all()

    return {
        "conversation": {
            "id": conv.id,
            "share_id": conv.share_id,
            "title": conv.title,
            "created_at": conv.created_at.isoformat(),
        },
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "audio_url": m.audio_url,
                "created_at": m.created_at.isoformat(),
            }
            for m in messages
        ],
    }


@router.get("/{conv_id}/messages", response_model=list[MessagePublic])
def get_messages(
    conv_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    conv = session.get(Conversation, conv_id)
    if not conv or conv.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return session.exec(
        select(Message)
        .where(Message.conversation_id == conv_id)
        .order_by(Message.created_at)
    ).all()


@router.delete("/{conv_id}")
def delete_conversation(
    conv_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    conv = session.get(Conversation, conv_id)
    if not conv or conv.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = session.exec(
        select(Message).where(Message.conversation_id == conv_id)
    ).all()
    for msg in messages:
        session.delete(msg)

    session.delete(conv)
    session.commit()
    return {"detail": "Deleted"}
