"use client";

import { useState } from "react";
import ChatSidebar from "@/components/ChatSidebar";
import ChatHeader from "@/components/ChatHeader";
import RecordButton, { type RecordingState } from "@/components/RecordButton";
import ChatWindow from "@/components/ChatWindow";
import ControlsBar from "@/components/ControlsBar";
import {
  getRandomReply,
  getRandomUserPhrase,
  type Message,
} from "@/lib/mockData";

let idCounter = 100;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [mode, setMode] = useState<"local" | "api">("local");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleRecordClick = () => {
    if (recordingState === "processing" || recordingState === "speaking") return;

    if (recordingState === "idle") {
      setRecordingState("recording");

      setTimeout(() => {
        setRecordingState("processing");

        const userText = getRandomUserPhrase();
        const userMsg: Message = {
          id: String(++idCounter),
          sender: "user",
          text: userText,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);

        setTimeout(() => {
          const aiText = getRandomReply();
          const aiMsg: Message = {
            id: String(++idCounter),
            sender: "ai",
            text: aiText,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMsg]);
          setRecordingState("speaking");

          setTimeout(() => setRecordingState("idle"), 2000);
        }, 1500);
      }, 2500);
    } else {
      setRecordingState("idle");
    }
  };

  const handleClearChat = () => setMessages([]);
  const handleToggleMode = () => setMode((p) => (p === "local" ? "api" : "local"));

  return (
    <div className="flex h-screen overflow-hidden bg-[#212121]">
      <ChatSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onNewChat={handleClearChat} />

      <div className="flex flex-1 flex-col">
        <ChatHeader onToggleSidebar={() => setSidebarOpen((p) => !p)} />

        <main className="flex flex-1 flex-col overflow-hidden">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-white">EchoCore</h2>
                <p className="mt-1 text-sm text-gray-400">How can I help you today?</p>
              </div>
              <RecordButton state={recordingState} onClick={handleRecordClick} />
            </div>
          ) : (
            <div className="flex flex-1 flex-col">
              <ChatWindow messages={messages} />

              <div className="border-t border-white/5 px-4 py-4">
                <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
                  <RecordButton state={recordingState} onClick={handleRecordClick} />
                  <ControlsBar
                    mode={mode}
                    onToggleMode={handleToggleMode}
                    onClearChat={handleClearChat}
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
