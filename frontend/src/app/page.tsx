"use client";

import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import RecordButton, { type RecordingState } from "@/components/RecordButton";
import ChatWindow from "@/components/ChatWindow";
import ControlsBar from "@/components/ControlsBar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import {
  initialMessages,
  getRandomReply,
  getRandomUserPhrase,
  type Message,
} from "@/lib/mockData";

let idCounter = 100;

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [mode, setMode] = useState<"local" | "api">("local");

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  const handleRecordClick = useCallback(() => {
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

          setTimeout(() => {
            setRecordingState("idle");
          }, 2000);
        }, 1500);
      }, 2500);
    } else {
      setRecordingState("idle");
    }
  }, [recordingState]);

  const handleClearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const handleToggleMode = useCallback(() => {
    setMode((prev) => (prev === "local" ? "api" : "local"));
  }, []);

  return (
    <div className="gradient-bg flex min-h-screen flex-col">
      <Header darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      <Sidebar />

      <main className="flex flex-1 flex-col items-center px-4 py-6 sm:px-6">
        <div className="flex w-full max-w-2xl flex-1 flex-col gap-4">
          <ChatWindow messages={messages} />

          <div className="flex flex-col items-center gap-6 py-4">
            <RecordButton state={recordingState} onClick={handleRecordClick} />
          </div>

          <ControlsBar
            mode={mode}
            onToggleMode={handleToggleMode}
            onClearChat={handleClearChat}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
