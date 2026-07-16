export interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  audioUrl?: string;
  timestamp: Date;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface VoiceProcessResponse {
  transcript: string;
  reply: string;
  audio_url: string | null;
  conversation_id: number;
  message_id: number;
}

export interface ApiMessage {
  id: number;
  conversation_id: number;
  role: string;
  content: string;
  audio_url: string | null;
  created_at: string;
}
