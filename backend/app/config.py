from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # STT
    stt_mode: str = "local"  # "local" or "api"
    openai_api_key: str = ""

    # LLM
    llm_provider: str = "gemini"  # "gemini" | "openrouter" | "ollama"
    gemini_api_key: str = ""
    openrouter_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"

    # TTS
    tts_mode: str = "edge"  # "edge" (free) | "pyttsx3" | "openai" | "elevenlabs"
    tts_voice: str = "nova"
    elevenlabs_api_key: str = ""

    # Auth
    jwt_secret: str = "change-this-to-a-random-secret"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    # Database
    database_url: str = "sqlite:///./echocore.db"

    # Server
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000,https://echocore-ai.vercel.app"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
