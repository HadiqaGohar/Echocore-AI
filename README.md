# EchoCore

**Speak to AI. Hear it reply.**

EchoCore is a voice-powered AI assistant portal that lets you talk to AI using your voice. It listens, understands, and responds — all in real-time.

---

## Features

- Voice Recording with animated mic button
- Speech-to-Text (STT) — local & API options
- AI Reply — Gemini, OpenRouter, Ollama support
- Text-to-Speech (TTS) — local & API options
- Dark/Light mode toggle
- Glassmorphism modern UI
- Conversation history
- Mobile responsive design

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
├── frontend/          # Next.js app
│   ├── src/
│   │   ├── app/       # Pages (App Router)
│   │   ├── components/# UI components
│   │   └── lib/       # Utilities & mock data
│   └── package.json
├── backend/           # FastAPI (planned)
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone the repo
git clone https://github.com/HadiqaGohar/Echocore.git
cd Echocore/frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Roadmap

- [x] Frontend UI with mock data
- [x] Record button with state animations
- [x] Dark/Light mode
- [x] Chat window with auto-scroll
- [x] Controls bar (Local/API toggle)
- [ ] Backend API (FastAPI)
- [ ] STT integration (faster-whisper / OpenAI)
- [ ] AI integration (Gemini / OpenRouter)
- [ ] TTS integration (pyttsx3 / OpenAI)
- [ ] User authentication (JWT)
- [ ] Conversation history (SQLite)
- [ ] Audio waveform visualization

---

## Contributing

Contributions are welcome! Please open an issue or submit a PR.

---

## Author

**Hadiqa Gohar**
