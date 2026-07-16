# EchoCore — Voice AI Assistant Portal

**Speak to AI. Hear it reply.**

EchoCore is a full-stack voice-powered AI assistant with STT → LLM → TTS pipeline, multi-language support (Hindi/Urdu/Roman Urdu), TTS converter, analytics dashboard, file upload transcription, and ChatGPT-style UI.

**Live Demo**: [https://echocore-ai.vercel.app](https://echocore-ai.vercel.app)

---

## Features

### Voice AI Chat (`/chat`)
- **Voice Input** — Web Speech API (browser-based, free) with MediaRecorder fallback for server-side STT
- **Text Input** — Type messages directly, get AI responses with TTS audio playback
- **File Upload** — Upload audio files (.wav, .mp3, .webm, .ogg, .flac) for transcription
- **Real-time TTS** — AI replies spoken aloud with Edge TTS neural voices
- **Conversation History** — Persistent chat history per user, grouped by time (Today, Yesterday, etc.)
- **Multi-language** — 11 languages: English, Hindi, Urdu, Roman Urdu, Pashto, Arabic, Bengali, Turkish, French, German, Spanish
- **Voice Gender Selection** — Male or female voice for each language
- **Dark/Light Mode** — System-wide theme with localStorage persistence
- **Share Conversations** — Unique shareable URL per conversation (like ChatGPT)
- **Authentication** — JWT-based register/login, per-user conversation isolation

### TTS Converter (`/tts`)
- Convert any text to natural-sounding speech
- Play or download as MP3
- Language and voice gender selector
- Copy text feature

### Analytics Dashboard (`/dashboard`)
- Total conversations, messages, TTS requests
- Daily activity chart (last 7 days)
- Language usage breakdown
- Interaction type distribution (voice/text/file)
- Voice gender preference stats

### Landing Page (`/`)
- Hero section with animated pipeline visualization
- Features grid (6 cards)
- How-it-works steps (4 steps)
- CTA to launch app
- Dark mode toggle

---

## Architecture

### Pipeline Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INPUT                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐              │
│  │  Voice   │  │   Text   │  │ File Upload  │              │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘              │
│       │              │               │                      │
│       ▼              │               ▼                      │
│  ┌─────────┐         │         ┌──────────┐                │
│  │   STT   │         │         │   STT    │                │
│  │ (Browser│         │         │(faster-  │                │
│  │  or     │         │         │ whisper) │                │
│  │ Server) │         │         └────┬─────┘                │
│  └────┬────┘         │              │                      │
│       │              │              │                      │
│       ▼              ▼              ▼                      │
│  ┌─────────────────────────────────────────┐              │
│  │              LLM (AI Reply)             │              │
│  │  ┌─────────┐  ┌──────────┐  ┌────────┐ │              │
│  │  │ Gemini  │→ │OpenRouter│→ │ Ollama │ │              │
│  │  │ (Free)  │  │ (Free)   │  │ (Local)│ │              │
│  │  └─────────┘  └──────────┘  └────────┘ │              │
│  └───────────────────┬─────────────────────┘              │
│                      │                                    │
│                      ▼                                    │
│  ┌─────────────────────────────────────────┐              │
│  │              TTS (Voice Reply)          │              │
│  │  ┌─────────┐  ┌──────────┐  ┌────────┐ │              │
│  │  │ Edge TTS│  │ pyttsx3  │  │ OpenAI │ │              │
│  │  │ (Free)  │  │ (Local)  │  │ (Paid) │ │              │
│  │  └─────────┘  └──────────┘  └────────┘ │              │
│  └───────────────────┬─────────────────────┘              │
│                      │                                    │
│                      ▼                                    │
│              ┌──────────────┐                             │
│              │ Audio Reply  │                             │
│              │ (Play + Save)│                             │
│              └──────────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

### STT (Speech-to-Text)

| Service | Cost | Quality | Used When |
|---------|------|---------|-----------|
| **Web Speech API** | Free | Good | Voice mode (browser-based, Chrome/Edge) |
| **faster-whisper** | Free | Excellent | File upload, MediaRecorder fallback (local) |
| **OpenAI Whisper API** | ~$0.006/min | Excellent | Fallback if faster-whisper unavailable |

**How it works:**
1. **Voice mode**: Browser's Web Speech API transcribes speech in real-time (free, no server needed)
2. **Fallback**: If browser STT unavailable, records audio with MediaRecorder → sends to server → faster-whisper transcribes
3. **File upload**: Audio file sent to server → faster-whisper transcribes locally

### TTS (Text-to-Speech)

| Service | Cost | Languages | Quality |
|---------|------|-----------|---------|
| **Edge TTS** | Free, unlimited | 10+ (Hindi, Urdu, English, etc.) | Neural (natural) |
| **pyttsx3** | Free | English only | Robotic |
| **OpenAI TTS** | ~$0.015/1K chars | 57 languages | Neural |
| **ElevenLabs** | Free tier limited | 29 languages | Ultra-realistic |

**Default**: Edge TTS — free, unlimited, best Hindi/Urdu neural voices.
- Hindi: `hi-IN-MadhurNeural` (male), `hi-IN-SwaraNeural` (female)
- Urdu: `ur-PK-AsadNeural` (male), `ur-PK-UzmaNeural` (female)
- English: `en-US-AvaNeural` (female), `en-US-AndrewNeural` (male)

### LLM (AI Reply)

| Service | Cost | Rate Limit | Model |
|---------|------|------------|-------|
| **Gemini** | Free tier | 1500 req/day | gemini-2.0-flash |
| **OpenRouter** | Free tier | Varies | openai/gpt-4o-mini |
| **Ollama** | Free (local) | Unlimited | gemma4:2b |

**Fallback chain**: Gemini → OpenRouter → MockLLM

### Language Detection

- **Roman Urdu detection**: Regex pattern matching (40+ Urdu words in Roman script)
- **Auto-transliteration**: LLM converts Roman Urdu reply to Urdu script for TTS pronunciation
- **Script preservation**: Responds in same script user writes in

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS v4, Framer Motion, Lucide React |
| **Backend** | FastAPI, Python 3.12, SQLModel, SQLite |
| **Auth** | JWT (python-jose), bcrypt |
| **STT** | Web Speech API, faster-whisper, OpenAI Whisper API |
| **LLM** | Google Gemini, OpenRouter, Ollama |
| **TTS** | Edge TTS (Microsoft), pyttsx3, OpenAI TTS, ElevenLabs |
| **Deployment** | Vercel (frontend), Render (backend via Docker) |

---

## Project Structure

```
EchoCore/
├── frontend/                          # Next.js 16 frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx               # Landing page (/)
│   │   │   ├── layout.tsx             # Root layout + AuthProvider
│   │   │   ├── globals.css            # Dark mode, gradients
│   │   │   ├── login/page.tsx         # Login page
│   │   │   ├── register/page.tsx      # Register page
│   │   │   ├── chat/page.tsx          # Voice AI chat (/chat)
│   │   │   ├── tts/page.tsx           # TTS converter (/tts)
│   │   │   ├── dashboard/page.tsx     # Analytics dashboard
│   │   │   └── share/[shareId]/       # Shared conversation view
│   │   ├── components/
│   │   │   ├── ChatHeader.tsx         # Header with share + dark mode
│   │   │   ├── ChatSidebar.tsx        # Conversation history sidebar
│   │   │   ├── ChatWindow.tsx         # Message list
│   │   │   ├── ChatBubble.tsx         # Message bubbles
│   │   │   ├── ChatInput.tsx          # Text input with send
│   │   │   ├── RecordButton.tsx       # Animated mic (4 states)
│   │   │   ├── ControlsBar.tsx        # Language/gender/mode controls
│   │   │   ├── LanguageSelector.tsx   # Language dropdown with flags
│   │   │   └── FileUpload.tsx         # Drag-drop audio upload
│   │   └── lib/
│   │       ├── api.ts                 # API client with auth headers
│   │       ├── types.ts               # TypeScript types
│   │       ├── authContext.tsx         # JWT auth state management
│   │       └── darkModeContext.tsx     # Dark mode state
│   ├── package.json
│   └── vercel.json
│
├── backend/                           # FastAPI backend
│   ├── app/
│   │   ├── main.py                    # FastAPI app, CORS, routers
│   │   ├── config.py                  # Settings (env vars)
│   │   ├── database.py                # SQLite + SQLModel
│   │   ├── deps.py                    # JWT auth dependency
│   │   ├── models/
│   │   │   ├── conversation.py        # User, Conversation, Message
│   │   │   └── analytics.py           # UsageLog, TTSRequest
│   │   ├── schemas/
│   │   │   └── conversation.py        # Pydantic models
│   │   ├── routers/
│   │   │   ├── auth.py                # Register + Login
│   │   │   ├── audio.py               # Voice/Text/Chat endpoints
│   │   │   ├── conversations.py       # CRUD + shared view
│   │   │   ├── tts.py                 # TTS convert/download
│   │   │   ├── analytics.py           # Dashboard + logging
│   │   │   └── transcribe.py          # File upload STT
│   │   ├── services/
│   │   │   ├── stt_service.py         # STT factory (whisper/api/mock)
│   │   │   ├── llm_service.py         # LLM factory (gemini/openrouter/ollama)
│   │   │   ├── tts_service.py         # TTS factory (edge/pyttsx3/openai)
│   │   │   ├── edge_tts_service.py    # Edge TTS with 10+ languages
│   │   │   └── pipeline.py            # STT→LLM→TTS orchestration
│   │   └── utils/
│   │       └── audio.py               # Audio conversion (webm→wav)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
│
├── docker-compose.yml
├── render.yaml
└── README.md
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Get JWT token |

### Voice/Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/voice/process` | Audio file → STT → LLM → TTS |
| POST | `/api/voice/text` | Text → LLM → TTS (JSON body) |
| POST | `/api/voice/chat` | Alias for `/voice/text` |

### TTS
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tts/convert` | Text → audio (returns audio bytes) |
| POST | `/api/tts/download` | Text → audio (triggers download) |
| GET | `/api/tts/voices` | List available voices |

### Transcription
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transcribe/` | Upload audio → get transcript |

### Conversations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations/` | List user's conversations |
| POST | `/api/conversations/` | Create new conversation |
| GET | `/api/conversations/{id}/messages` | Get conversation messages |
| DELETE | `/api/conversations/{id}` | Delete conversation |
| GET | `/api/conversations/shared/{shareId}` | Get shared conversation (public) |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Get dashboard stats |
| POST | `/api/analytics/log` | Log interaction |

---

## Environment Variables

### Backend (`.env` / Render)

```env
# STT
STT_MODE=local              # "local" (faster-whisper) or "api" (OpenAI Whisper)

# LLM
LLM_PROVIDER=gemini         # "gemini" | "openrouter" | "ollama"
GEMINI_API_KEY=             # Google Gemini API key
OPENROUTER_API_KEY=         # OpenRouter API key (fallback)
OLLAMA_BASE_URL=http://localhost:11434

# TTS
TTS_MODE=edge               # "edge" (free) | "pyttsx3" | "openai" | "elevenlabs"

# Auth
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# Database
DATABASE_URL=sqlite:///./echocore.db

# CORS
CORS_ORIGINS=http://localhost:3000,https://echocore-ai.vercel.app
```

### Frontend (Vercel)

```env
NEXT_PUBLIC_API_URL=https://echocore-ai-backend.onrender.com
```

---

## Deployment

### Vercel (Frontend)
1. Connect GitHub repo to Vercel
2. Set `NEXT_PUBLIC_API_URL` in environment variables
3. Deploy automatically on push

### Render (Backend)
1. Connect GitHub repo to Render
2. Use Dockerfile at `backend/Dockerfile`
3. Set environment variables in Render dashboard
4. Deploy automatically on push

### Local Development

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## Key Design Decisions

1. **Edge TTS** over pyttsx3/OpenAI TTS — free, unlimited, best Hindi/Urdu neural voices
2. **Web Speech API** for voice STT — browser-based, free, no server dependencies
3. **Gemini + OpenRouter fallback** — free tier with automatic failover
4. **faster-whisper** for file STT — local, free, no API key needed
5. **SQLite** — simple, no external database service needed
6. **JWT auth** — stateless, works with serverless deployments
7. **Share with unique IDs** — each conversation gets a 12-char UUID for public sharing

---

## Author

**Hadiqa Gohar**
