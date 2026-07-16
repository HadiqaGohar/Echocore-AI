import type {
  Conversation,
  ApiMessage,
  VoiceProcessResponse,
  LanguageCode,
  VoiceGender,
} from "./types";

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
    options: {
      conversationId?: number;
      sttMode?: string;
      llmProvider?: string;
      ttsMode?: string;
      language?: LanguageCode;
      voiceGender?: VoiceGender;
    } = {}
  ): Promise<VoiceProcessResponse> {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");
    if (options.conversationId) {
      formData.append("conversation_id", String(options.conversationId));
    }
    formData.append("stt_mode", options.sttMode || "local");
    formData.append("llm_provider", options.llmProvider || "gemini");
    formData.append("tts_mode", options.ttsMode || "edge");
    formData.append("language", options.language || "en");
    formData.append("voice_gender", options.voiceGender || "female");

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
