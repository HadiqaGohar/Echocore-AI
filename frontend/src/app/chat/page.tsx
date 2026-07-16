"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import ChatSidebar from "@/components/ChatSidebar";
import ChatHeader from "@/components/ChatHeader";
import RecordButton, { type RecordingState } from "@/components/RecordButton";
import ChatWindow from "@/components/ChatWindow";
import ChatInput from "@/components/ChatInput";
import ControlsBar from "@/components/ControlsBar";
import FileUpload from "@/components/FileUpload";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import type { Message, LanguageCode, VoiceGender } from "@/lib/types";

let idCounter = 0;

export default function ChatPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [mode, setMode] = useState<"local" | "api">("local");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [voiceGender, setVoiceGender] = useState<VoiceGender>("female");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");
  const [showFileUpload, setShowFileUpload] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      mediaRecorderRef.current?.stop();
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const processVoiceText = async (transcript: string) => {
    setRecordingState("processing");
    const userMsgId = String(++idCounter);
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: "user", text: transcript, timestamp: new Date() },
    ]);

    try {
      const result = await api.sendTextMessage(transcript, {
        conversationId: conversationId || undefined,
        llmProvider: "gemini",
        ttsMode: "edge",
        language,
        voiceGender,
      });

      if (!conversationId) setConversationId(result.conversation_id);

      const aiMsg: Message = {
        id: String(++idCounter),
        sender: "ai",
        text: result.reply,
        audioUrl: result.audio_url || undefined,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (result.audio_url) {
        setRecordingState("speaking");
        const audio = new Audio(api.getAudioUrl(result.audio_url));
        audioRef.current = audio;
        audio.onended = () => setRecordingState("idle");
        audio.onerror = () => setRecordingState("idle");
        audio.play().catch(() => setRecordingState("idle"));
      } else {
        setRecordingState("idle");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setRecordingState("idle");
      setMessages((prev) => prev.filter((msg) => msg.id !== userMsgId));
    }
  };

  const processVoiceAudio = async (audioBlob: Blob) => {
    setRecordingState("processing");
    const userMsgId = String(++idCounter);
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: "user", text: "(voice message)", timestamp: new Date() },
    ]);

    try {
      const result = await api.processVoice(audioBlob, {
        conversationId: conversationId || undefined,
        sttMode: "local",
        llmProvider: "gemini",
        ttsMode: "edge",
        language,
        voiceGender,
      });

      if (!conversationId) setConversationId(result.conversation_id);

      // Update the user message with actual transcript
      setMessages((prev) =>
        prev.map((m) => (m.id === userMsgId ? { ...m, text: result.transcript } : m))
      );

      const aiMsg: Message = {
        id: String(++idCounter),
        sender: "ai",
        text: result.reply,
        audioUrl: result.audio_url || undefined,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (result.audio_url) {
        setRecordingState("speaking");
        const audio = new Audio(api.getAudioUrl(result.audio_url));
        audioRef.current = audio;
        audio.onended = () => setRecordingState("idle");
        audio.onerror = () => setRecordingState("idle");
        audio.play().catch(() => setRecordingState("idle"));
      } else {
        setRecordingState("idle");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Voice processing failed");
      setRecordingState("idle");
      setMessages((prev) => prev.filter((msg) => msg.id !== userMsgId));
    }
  };

  const handleRecordClick = useCallback(async () => {
    if (recordingState === "processing" || recordingState === "speaking") return;

    if (recordingState === "idle") {
      // Try Web Speech API first (free, browser-based STT)
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;

          const langMap: Record<string, string> = {
            en: "en-US", hi: "hi-IN", ur: "ur-PK", ar: "ar-SA",
            fr: "fr-FR", de: "de-DE", es: "es-ES", tr: "tr-TR", bn: "bn-BD",
          };
          recognition.lang = langMap[language] || "en-US";

          recognition.onresult = async (event: any) => {
            const transcript = event.results[0][0].transcript;
            recognitionRef.current = null;
            await processVoiceText(transcript);
          };

          recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            recognitionRef.current = null;
            if (event.error === "not-allowed" || event.error === "service-not-allowed") {
              // Fall back to MediaRecorder
              startMediaRecording();
            } else if (event.error !== "aborted") {
              setRecordingState("idle");
              setError(`Speech recognition failed: ${event.error}`);
            }
          };

          recognition.onend = () => {
            recognitionRef.current = null;
          };

          recognitionRef.current = recognition;
          recognition.start();
          setRecordingState("recording");
          setError(null);
          return;
        } catch (err) {
          // Web Speech API failed, fall through to MediaRecorder
        }
      }

      // Fallback: Use MediaRecorder + server-side STT
      startMediaRecording();
    } else if (recordingState === "recording") {
      // Stop either Web Speech API or MediaRecorder
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      } else if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setRecordingState("processing");
    }
  }, [recordingState, language, voiceGender, conversationId]);

  const startMediaRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (audioBlob.size > 0) {
          await processVoiceAudio(audioBlob);
        } else {
          setRecordingState("idle");
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecordingState("recording");
      setError(null);
    } catch (err) {
      setRecordingState("idle");
      setError("Microphone access denied. Please allow microphone access.");
    }
  };

  const handleSendText = async (text: string) => {
    const userMsgId = String(++idCounter);
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: "user", text, timestamp: new Date() },
    ]);
    setRecordingState("processing");

    try {
      const result = await api.sendTextMessage(text, {
        conversationId: conversationId || undefined,
        llmProvider: "gemini",
        ttsMode: "edge",
        language,
        voiceGender,
      });

      if (!conversationId) setConversationId(result.conversation_id);

      const aiMsg: Message = {
        id: String(++idCounter),
        sender: "ai",
        text: result.reply,
        audioUrl: result.audio_url || undefined,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (result.audio_url) {
        setRecordingState("speaking");
        const audio = new Audio(api.getAudioUrl(result.audio_url));
        audioRef.current = audio;
        audio.onended = () => setRecordingState("idle");
        audio.onerror = () => setRecordingState("idle");
        audio.play().catch(() => setRecordingState("idle"));
      } else {
        setRecordingState("idle");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setRecordingState("idle");
    }
  };

  const handleFileTranscription = (text: string) => {
    setShowFileUpload(false);
    handleSendText(text);
  };

  const handleClearChat = () => {
    setMessages([]);
    setConversationId(null);
    setShareId(null);
    setError(null);
    audioRef.current?.pause();
    audioRef.current = null;
  };

  return (
    <div className="gradient-bg flex h-screen overflow-hidden">
      <ChatSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleClearChat}
        onSelectConversation={async (id, newShareId) => {
          setConversationId(id);
          setShareId(newShareId);
          setMessages([]);
          try {
            const apiMessages = await api.getMessages(id);
            const mapped: Message[] = apiMessages.map((m) => ({
              id: String(m.id),
              sender: m.role === "assistant" ? "ai" : "user",
              text: m.content,
              audioUrl: m.audio_url || undefined,
              timestamp: new Date(m.created_at),
            }));
            setMessages(mapped);
          } catch (err) {
            console.error("Failed to load messages:", err);
            setError("Failed to load conversation messages");
          }
        }}
      />

      <div className="flex flex-1 flex-col">
        <ChatHeader onToggleSidebar={() => setSidebarOpen((p) => !p)} shareId={shareId} />

        <main className="flex flex-1 flex-col overflow-hidden">
          {error && (
            <div className="mx-auto mt-2 max-w-3xl rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500 dark:bg-red-500/10 dark:text-red-400">
              {error}
              <button onClick={() => setError(null)} className="ml-2 underline">dismiss</button>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">EchoCore</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">How can I help you today?</p>
              </div>

              {showFileUpload ? (
                <div className="w-full max-w-md">
                  <FileUpload language={language} onTranscription={handleFileTranscription} />
                  <button onClick={() => setShowFileUpload(false)} className="mt-2 text-xs text-gray-400 hover:text-gray-600">
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <RecordButton state={recordingState} onClick={handleRecordClick} />

                  <div className="flex items-center gap-1 rounded-full border border-black/10 bg-white/50 p-1 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                    <button
                      onClick={() => setInputMode("voice")}
                      className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                        inputMode === "voice"
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                      }`}
                    >
                      Voice
                    </button>
                    <button
                      onClick={() => setInputMode("text")}
                      className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                        inputMode === "text"
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                      }`}
                    >
                      Text
                    </button>
                    <button
                      onClick={() => setShowFileUpload(!showFileUpload)}
                      className="rounded-full px-3 py-1.5 text-xs font-medium text-gray-500 transition-all hover:text-gray-700 dark:text-gray-400"
                    >
                      File
                    </button>
                  </div>

                  <ControlsBar
                    mode={mode}
                    language={language}
                    voiceGender={voiceGender}
                    onToggleMode={() => setMode((p) => (p === "local" ? "api" : "local"))}
                    onClearChat={handleClearChat}
                    onLanguageChange={setLanguage}
                    onGenderChange={setVoiceGender}
                  />
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-1 flex-col">
              <ChatWindow messages={messages} />

              <div className="border-t border-black/5 px-4 py-4 dark:border-white/5">
                <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
                  {showFileUpload ? (
                    <div className="w-full">
                      <FileUpload language={language} onTranscription={handleFileTranscription} />
                      <button onClick={() => setShowFileUpload(false)} className="mt-2 text-xs text-gray-400 hover:text-gray-600">
                        Cancel
                      </button>
                    </div>
                  ) : inputMode === "voice" ? (
                    <RecordButton state={recordingState} onClick={handleRecordClick} />
                  ) : (
                    <div className="w-full">
                      <ChatInput
                        mode={inputMode}
                        language={language}
                        voiceGender={voiceGender}
                        onModeChange={setInputMode}
                        onSendMessage={handleSendText}
                        onFileUpload={() => setShowFileUpload(true)}
                      />
                    </div>
                  )}

                  <ControlsBar
                    mode={mode}
                    language={language}
                    voiceGender={voiceGender}
                    onToggleMode={() => setMode((p) => (p === "local" ? "api" : "local"))}
                    onClearChat={handleClearChat}
                    onLanguageChange={setLanguage}
                    onGenderChange={setVoiceGender}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
