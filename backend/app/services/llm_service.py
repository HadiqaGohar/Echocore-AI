import httpx

from ..config import settings


class LLMService:
    async def chat(self, messages: list[dict], system_prompt: str = "") -> str:
        raise NotImplementedError


class GeminiLLM(LLMService):
    def __init__(self):
        if not settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY not set in .env")
        from google import genai

        self.client = genai.Client(api_key=settings.gemini_api_key)

    async def chat(self, messages: list[dict], system_prompt: str = "") -> str:
        contents = []
        if system_prompt:
            contents.append({"role": "user", "parts": [system_prompt]})
            contents.append({"role": "model", "parts": ["Understood."]})

        for m in messages:
            contents.append({"role": m["role"], "parts": [m["content"]]})

        response = await self.client.aio.models.generate_content(
            model="gemini-2.5-flash", contents=contents
        )
        return response.text


class OpenRouterLLM(LLMService):
    def __init__(self):
        if not settings.openrouter_api_key:
            raise RuntimeError("OPENROUTER_API_KEY not set in .env")
        from openai import AsyncOpenAI

        self.client = AsyncOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.openrouter_api_key,
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
    def __init__(self):
        self.base_url = settings.ollama_base_url

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


def get_llm_service() -> LLMService:
    provider = settings.llm_provider.lower()
    try:
        if provider == "openrouter":
            return OpenRouterLLM()
        if provider == "ollama":
            return OllamaLLM()
        return GeminiLLM()
    except RuntimeError:
        return MockLLM()
