import type { Conversation, ApiMessage, VoiceProcessResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || API_URL;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(error.detail || `API error: ${res.status}`);
    }
    return res.json();
  }

  async processVoice(
    audioBlob: Blob,
    conversationId?: number,
    sttMode = "local",
    llmProvider = "gemini",
    ttsMode = "local"
  ): Promise<VoiceProcessResponse> {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");
    if (conversationId) {
      formData.append("conversation_id", String(conversationId));
    }
    formData.append("stt_mode", sttMode);
    formData.append("llm_provider", llmProvider);
    formData.append("tts_mode", ttsMode);

    const res = await fetch(`${this.baseUrl}/api/voice/process`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(error.detail || `Voice process error: ${res.status}`);
    }
    return res.json();
  }

  async listConversations(): Promise<Conversation[]> {
    return this.request<Conversation[]>("/api/conversations/");
  }

  async createConversation(title: string): Promise<Conversation> {
    return this.request<Conversation>("/api/conversations/", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
  }

  async getMessages(conversationId: number): Promise<ApiMessage[]> {
    return this.request<ApiMessage[]>(`/api/conversations/${conversationId}/messages`);
  }

  async deleteConversation(conversationId: number): Promise<void> {
    await this.request(`/api/conversations/${conversationId}`, {
      method: "DELETE",
    });
  }

  getAudioUrl(path: string): string {
    if (path.startsWith("http")) return path;
    return `${this.baseUrl}${path}`;
  }
}

export const api = new ApiClient();
