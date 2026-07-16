"use client";

import { useState, useRef, useCallback } from "react";
import ChatSidebar from "@/components/ChatSidebar";
import ChatHeader from "@/components/ChatHeader";
import RecordButton, { type RecordingState } from "@/components/RecordButton";
import ChatWindow from "@/components/ChatWindow";
import ControlsBar from "@/components/ControlsBar";
import { api } from "@/lib/api";
import type { Message, LanguageCode, VoiceGender } from "@/lib/types";

let idCounter = 0;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [mode, setMode] = useState<"local" | "api">("local");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [voiceGender, setVoiceGender] = useState<VoiceGender>("female");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleRecordClick = useCallback(async () => {
    if (recordingState === "processing" || recordingState === "speaking") return;

    if (recordingState === "idle") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
            ? "audio/webm;codecs=opus"
            : "audio/webm",
        });

        audioChunksRef.current = [];
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          await processAudio(audioBlob);
        };

        mediaRecorder.start();
        setRecordingState("recording");
        setError(null);
      } catch (err) {
        setError("Microphone access denied. Please allow microphone access.");
        console.error("Microphone error:", err);
      }
    } else if (recordingState === "recording") {
      mediaRecorderRef.current?.stop();
      setRecordingState("processing");
    }
  }, [recordingState, language, voiceGender, mode, conversationId]);

  const processAudio = async (audioBlob: Blob) => {
    try {
      const userMsgId = String(++idCounter);
      setMessages((prev) => [
        ...prev,
        {
          id: userMsgId,
          sender: "user",
          text: "Processing your voice...",
          timestamp: new Date(),
        },
      ]);

      const result = await api.processVoice(audioBlob, {
        conversationId: conversationId || undefined,
        sttMode: mode === "local" ? "local" : "api",
        llmProvider: "gemini",
        ttsMode: "edge",
        language,
        voiceGender,
      });

      if (!conversationId) {
        setConversationId(result.conversation_id);
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMsgId ? { ...msg, text: result.transcript } : msg
        )
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
      setError(err instanceof Error ? err.message : "Something went wrong");
      setRecordingState("idle");
      setMessages((prev) => prev.filter((msg) => msg.text !== "Processing your voice..."));
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setConversationId(null);
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
        onSelectConversation={async (id) => {
          setConversationId(id);
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
          } catch {
            // ignore
          }
        }}
      />

      <div className="flex flex-1 flex-col">
        <ChatHeader onToggleSidebar={() => setSidebarOpen((p) => !p)} />

        <main className="flex flex-1 flex-col overflow-hidden">
          {error && (
            <div className="mx-auto mt-2 max-w-3xl rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500 dark:bg-red-500/10 dark:text-red-400">
              {error}
              <button onClick={() => setError(null)} className="ml-2 underline">
                dismiss
              </button>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  EchoCore
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  How can I help you today?
                </p>
              </div>
              <RecordButton state={recordingState} onClick={handleRecordClick} />
            </div>
          ) : (
            <div className="flex flex-1 flex-col">
              <ChatWindow messages={messages} />

              <div className="border-t border-black/5 px-4 py-4 dark:border-white/5">
                <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
                  <RecordButton state={recordingState} onClick={handleRecordClick} />
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
