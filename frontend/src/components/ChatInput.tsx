"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Mic, Send, Paperclip } from "lucide-react";
import { api } from "@/lib/api";
import type { LanguageCode, VoiceGender } from "@/lib/types";

interface ChatInputProps {
  mode: "voice" | "text";
  language: LanguageCode;
  voiceGender: VoiceGender;
  onModeChange: (mode: "voice" | "text") => void;
  onSendMessage: (text: string) => void;
  onFileUpload: () => void;
}

export default function ChatInput({
  mode,
  language,
  voiceGender,
  onModeChange,
  onSendMessage,
  onFileUpload,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    if (text.trim()) {
      onSendMessage(text.trim());
      setText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }, [text, onSendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  return (
    <div className="flex items-end gap-2">
      {/* File upload button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onFileUpload}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white text-gray-500 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
        title="Upload audio file"
      >
        <Paperclip className="h-4 w-4" />
      </motion.button>

      {/* Text input area */}
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-400"
        />
      </div>

      {/* Send button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSubmit}
        disabled={!text.trim()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 disabled:opacity-50 disabled:shadow-none"
      >
        <Send className="h-4 w-4" />
      </motion.button>
    </div>
  );
}
