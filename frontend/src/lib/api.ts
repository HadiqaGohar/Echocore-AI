import type {
  Conversation,
  ApiMessage,
  VoiceProcessResponse,
  LanguageCode,
  VoiceGender,
  DashboardData,
  TranscriptionResult,
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

  async sendTextMessage(
    text: string,
    options: {
      conversationId?: number;
      llmProvider?: string;
      ttsMode?: string;
      language?: LanguageCode;
      voiceGender?: VoiceGender;
    } = {}
  ): Promise<VoiceProcessResponse> {
    // Create a silent audio blob to send through the voice pipeline
    // This is a workaround - we send text as if it were a voice message
    const formData = new FormData();

    // Create a minimal WAV file (silent)
    const sampleRate = 16000;
    const duration = 0.1;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);
    // WAV header
    view.setUint32(0, 0x46464952, true); // "RIFF"
    view.setUint32(4, 36 + numSamples * 2, true);
    view.setUint32(8, 0x45564157, true); // "WAVE"
    view.setUint32(12, 0x20746d66, true); // "fmt "
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    view.setUint32(36, 0x61746164, true); // "data"
    view.setUint32(40, numSamples * 2, true);
    // Silence
    for (let i = 0; i < numSamples; i++) {
      view.setInt16(44 + i * 2, 0, true);
    }

    const silentBlob = new Blob([buffer], { type: "audio/wav" });
    formData.append("file", silentBlob, "text_input.wav");

    if (options.conversationId) {
      formData.append("conversation_id", String(options.conversationId));
    }
    formData.append("stt_mode", "text");
    formData.append("llm_provider", options.llmProvider || "gemini");
    formData.append("tts_mode", options.ttsMode || "edge");
    formData.append("language", options.language || "en");
    formData.append("voice_gender", options.voiceGender || "female");
    formData.append("text", text);

    const res = await fetch(`${this.baseUrl}/api/voice/text`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(error.detail || `Text process error: ${res.status}`);
    }
    return res.json();
  }

  async convertTTS(
    text: string,
    language: LanguageCode = "en",
    voiceGender: VoiceGender = "female"
  ): Promise<Blob> {
    const formData = new FormData();
    formData.append("text", text);
    formData.append("language", language);
    formData.append("voice_gender", voiceGender);
    formData.append("tts_mode", "edge");

    const res = await fetch(`${this.baseUrl}/api/tts/convert`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(error.detail || `TTS error: ${res.status}`);
    }
    return res.blob();
  }

  async downloadTTS(
    text: string,
    language: LanguageCode = "en",
    voiceGender: VoiceGender = "female"
  ): Promise<void> {
    const formData = new FormData();
    formData.append("text", text);
    formData.append("language", language);
    formData.append("voice_gender", voiceGender);
    formData.append("tts_mode", "edge");

    const res = await fetch(`${this.baseUrl}/api/tts/download`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(error.detail || `TTS download error: ${res.status}`);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `echocore_tts_${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async transcribeFile(
    file: File,
    sttMode: string = "local",
    language: string = "auto"
  ): Promise<TranscriptionResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("stt_mode", sttMode);
    formData.append("language", language);

    const res = await fetch(`${this.baseUrl}/api/transcribe/`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(error.detail || `Transcription error: ${res.status}`);
    }
    return res.json();
  }

  async getDashboard(): Promise<DashboardData> {
    return this.request<DashboardData>("/api/analytics/dashboard");
  }

  async logInteraction(data: {
    interaction_type: string;
    language?: string;
    voice_gender?: string;
    stt_mode?: string;
    tts_mode?: string;
    llm_provider?: string;
    transcript_length?: number;
    reply_length?: number;
    processing_time_ms?: number;
  }): Promise<void> {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    await fetch(`${this.baseUrl}/api/analytics/log?${params}`, { method: "POST" });
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
