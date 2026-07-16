# EchoCore

**Speak to AI. Hear it reply.**

EchoCore is a voice-powered AI assistant portal that lets you talk to AI using your voice. It listens, understands, and responds — all in real-time.

---

## Features

- **Landing page** — Hero section, features grid, how-it-works, CTA
- **Chat page** — ChatGPT-style interface with collapsible sidebar
- **Voice Recording** — Animated mic button with 4 states (idle/recording/processing/speaking)
- **Conversation History** — Sidebar with grouped history (Today, Yesterday, etc.)
- **New Chat** — Start fresh conversations
- **Dark/Light mode** toggle
- **Glassmorphism + Gradient** modern UI
- **Fully responsive** — works on mobile & desktop

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features, how-it-works |
| `/chat` | Voice AI chat with ChatGPT-style sidebar |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4, Framer Motion |
| Backend (planned) | FastAPI, Python, uv |
| STT (planned) | faster-whisper (local), OpenAI Whisper API |
| AI | Gemini API, OpenRouter, Ollama |
| TTS (planned) | pyttsx3 (local), OpenAI TTS, ElevenLabs |
| Database (planned) | SQLite + SQLAlchemy |

---

## Project Structure

```
EchoCore/
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx          # Landing page (/)
│       │   ├── layout.tsx
│       │   ├── globals.css
│       │   └── chat/
│       │       └── page.tsx      # Chat page (/chat)
│       ├── components/
│       │   ├── ChatSidebar.tsx   # ChatGPT-style sidebar
│       │   ├── ChatHeader.tsx    # Chat page header
│       │   ├── RecordButton.tsx  # Animated mic button
│       │   ├── ChatBubble.tsx    # Message bubbles
│       │   ├── ChatWindow.tsx    # Message list
│       │   └── ControlsBar.tsx   # Local/API toggle, voice, clear
│       └── lib/
│           └── mockData.ts       # Dummy data for testing
├── backend/                      # FastAPI (planned)
├── .gitignore
└── README.md
```

---

## Getting Started

```bash
git clone https://github.com/HadiqaGohar/Echocore.git
cd Echocore/frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Roadmap

- [x] Landing page with hero & features
- [x] Chat page with ChatGPT-style sidebar
- [x] Conversation history (mock data)
- [x] New chat / clear chat
- [x] Record button with state animations
- [x] Dark/Light mode
- [x] Glassmorphism + gradient design
- [ ] Backend API (FastAPI)
- [ ] STT integration (faster-whisper / OpenAI)
- [ ] AI integration (Gemini / OpenRouter)
- [ ] TTS integration (pyttsx3 / OpenAI)
- [ ] User authentication (JWT)
- [ ] Real conversation persistence (SQLite)
- [ ] Audio waveform visualization

---

## Author

**Hadiqa Gohar**
