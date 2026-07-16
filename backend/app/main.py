import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .database import create_db_and_tables
from .routers import audio, conversations, auth, tts, analytics, transcribe


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    os.makedirs("audio", exist_ok=True)
    yield


app = FastAPI(
    title="EchoCore API",
    description="Voice AI Assistant Backend - Multi-language, TTS, STT, Analytics",
    version="0.2.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api")
app.include_router(audio.router, prefix="/api")
app.include_router(conversations.router, prefix="/api")
app.include_router(tts.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(transcribe.router, prefix="/api")

# Serve generated audio files
os.makedirs("audio", exist_ok=True)
app.mount("/audio", StaticFiles(directory="audio"), name="audio")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "echocore-backend", "version": "0.2.0"}
