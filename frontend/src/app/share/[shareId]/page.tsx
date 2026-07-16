"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, User, Bot } from "lucide-react";
import { api } from "@/lib/api";
import { useDarkMode } from "@/lib/darkModeContext";
import type { ApiMessage } from "@/lib/types";

interface SharedConversation {
  id: number;
  share_id: string;
  title: string;
  created_at: string;
}

export default function SharedChatPage() {
  const params = useParams();
  const shareId = params.shareId as string;
  const [conversation, setConversation] = useState<SharedConversation | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { darkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    api.getSharedConversation(shareId)
      .then((data) => {
        setConversation(data.conversation);
        setMessages(data.messages);
      })
      .catch((err) => {
        setError(err.message || "Failed to load shared conversation");
      })
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) {
    return (
      <div className="gradient-bg flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="gradient-bg flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-gray-500 dark:text-gray-400">{error || "Conversation not found"}</p>
        <Link href="/" className="text-sm text-blue-500 hover:text-blue-600">
          Go to EchoCore
        </Link>
      </div>
    );
  }

  return (
    <div className="gradient-bg flex min-h-screen flex-col">
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">EchoCore</span>
          </Link>
          <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px]">
            {conversation.title}
          </h1>
          <button
            onClick={toggleDarkMode}
            className="rounded-lg p-2 text-gray-500 hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/10"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </nav>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    : "border border-black/5 bg-white/70 text-gray-900 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.audio_url && (
                  <audio controls className="mt-2 w-full" src={api.getAudioUrl(msg.audio_url)}>
                    Your browser does not support audio.
                  </audio>
                )}
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
        <div className="mx-auto max-w-3xl px-4 py-4 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Shared conversation from EchoCore
          </p>
          <Link href="/login" className="mt-2 inline-block text-xs font-medium text-blue-500 hover:text-blue-600">
            Try EchoCore yourself →
          </Link>
        </div>
      </footer>
    </div>
  );
}
