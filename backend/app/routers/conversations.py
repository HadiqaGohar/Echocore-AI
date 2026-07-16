from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..database import get_session
from ..models import Conversation, Message
from ..schemas import ConversationPublic, MessagePublic, ConversationCreate

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("/", response_model=list[ConversationPublic])
def list_conversations(
    session: Session = Depends(get_session),
    offset: int = 0,
    limit: int = 50,
):
    return session.exec(
        select(Conversation)
        .where(Conversation.user_id == 1)
        .order_by(Conversation.updated_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()


@router.post("/", response_model=ConversationPublic)
def create_conversation(
    data: ConversationCreate,
    session: Session = Depends(get_session),
):
    conv = Conversation(title=data.title, user_id=1)
    session.add(conv)
    session.commit()
    session.refresh(conv)
    return conv


@router.get("/{conv_id}/messages", response_model=list[MessagePublic])
def get_messages(conv_id: int, session: Session = Depends(get_session)):
    conv = session.get(Conversation, conv_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return session.exec(
        select(Message)
        .where(Message.conversation_id == conv_id)
        .order_by(Message.created_at)
    ).all()


@router.delete("/{conv_id}")
def delete_conversation(conv_id: int, session: Session = Depends(get_session)):
    conv = session.get(Conversation, conv_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Delete all messages first
    messages = session.exec(
        select(Message).where(Message.conversation_id == conv_id)
    ).all()
    for msg in messages:
        session.delete(msg)

    session.delete(conv)
    session.commit()
    return {"detail": "Deleted"}
