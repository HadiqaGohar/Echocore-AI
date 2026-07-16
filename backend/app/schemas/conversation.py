from datetime import datetime

from pydantic import BaseModel


# --- Auth ---
class UserRegister(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserPublic(BaseModel):
    id: int
    username: str
    email: str

    model_config = {"from_attributes": True}


# --- Conversation ---
class ConversationPublic(BaseModel):
    id: int
    share_id: str
    title: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MessagePublic(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    audio_url: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Voice Pipeline ---
class VoiceProcessResponse(BaseModel):
    transcript: str
    reply: str
    audio_url: str | None = None
    conversation_id: int
    message_id: int


class ConversationCreate(BaseModel):
    title: str = "New Conversation"
