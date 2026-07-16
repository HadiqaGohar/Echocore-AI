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

export type LanguageCode = "en" | "hi" | "ur" | "ps" | "ar" | "bn" | "tr" | "fr" | "de" | "es";

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "ur", name: "Urdu", nativeName: "اردو", flag: "🇵🇰" },
  { code: "ps", name: "Pashto", nativeName: "پښتو", flag: "🇦🇫" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇧🇩" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
];

export type VoiceGender = "male" | "female";
