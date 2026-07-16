import logging
import httpx

logger = logging.getLogger(__name__)


class LLMService:
    async def chat(self, messages: list[dict], system_prompt: str = "") -> str:
        raise NotImplementedError


class GeminiLLM(LLMService):
    def __init__(self, api_key: str):
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY not set")
        from google import genai

        self.client = genai.Client(api_key=api_key)

    async def chat(self, messages: list[dict], system_prompt: str = "") -> str:
        contents = []
        if system_prompt:
            contents.append({"role": "user", "parts": [{"text": system_prompt}]})
            contents.append({"role": "model", "parts": [{"text": "Understood."}]})

        for m in messages:
            role = "model" if m["role"] == "assistant" else m["role"]
            contents.append({"role": role, "parts": [{"text": m["content"]}]})

        # Try gemini-2.0-flash first (1500 req/day free), fallback to 1.5-flash
        models = ["gemini-2.0-flash", "gemini-1.5-flash"]
        last_error = None
        for model in models:
            try:
                logger.info(f"Trying model: {model}")
                response = await self.client.aio.models.generate_content(
                    model=model, contents=contents
                )
                return response.text
            except Exception as e:
                last_error = e
                error_str = str(e)
                if "RESOURCE_EXHAUSTED" in error_str or "429" in error_str:
                    logger.warning(f"Model {model} quota exhausted, trying next...")
                    continue
                # Non-quota error, raise immediately
                raise
        # All models exhausted
        raise last_error


class OpenRouterLLM(LLMService):
    def __init__(self, api_key: str):
        if not api_key:
            raise RuntimeError("OPENROUTER_API_KEY not set")
        from openai import AsyncOpenAI

        self.client = AsyncOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )

    async def chat(self, messages: list[dict], system_prompt: str = "") -> str:
        full_messages = []
        if system_prompt:
            full_messages.append({"role": "system", "content": system_prompt})
        full_messages.extend(messages)

        completion = await self.client.chat.completions.create(
            model="openai/gpt-4o-mini", messages=full_messages
        )
        return completion.choices[0].message.content


class OllamaLLM(LLMService):
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url

    async def chat(self, messages: list[dict], system_prompt: str = "") -> str:
        full_messages = []
        if system_prompt:
            full_messages.append({"role": "system", "content": system_prompt})
        full_messages.extend(messages)

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": "gemma4:2b",
                    "messages": full_messages,
                    "stream": False,
                },
            )
            resp.raise_for_status()
            return resp.json()["message"]["content"]


class MockLLM(LLMService):
    """Fallback mock LLM for testing without API keys."""

    async def chat(self, messages: list[dict], system_prompt: str = "") -> str:
        last_user = messages[-1]["content"] if messages else "hello"
        return (
            f"I received your message: '{last_user}'. "
            "This is a mock reply. Please configure an LLM provider in .env "
            "(GEMINI_API_KEY, OPENROUTER_API_KEY, or Ollama)."
        )


def get_llm_service(provider: str = "gemini") -> LLMService:
    from ..config import settings

    try:
        if provider == "openrouter":
            key = settings.openrouter_api_key
            if not key:
                logger.warning("OPENROUTER_API_KEY is empty, using MockLLM")
                return MockLLM()
            return OpenRouterLLM(key)
        if provider == "ollama":
            return OllamaLLM(settings.ollama_base_url)
        key = settings.gemini_api_key
        if not key:
            logger.warning("GEMINI_API_KEY is empty, using MockLLM")
            return MockLLM()
        logger.info(f"Using GeminiLLM with key length={len(key)}")
        return GeminiLLM(key)
    except Exception as e:
        logger.error(f"Failed to init LLM provider '{provider}': {e}")
        return MockLLM()
