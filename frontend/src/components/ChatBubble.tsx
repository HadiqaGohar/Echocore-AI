"use client";

import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import type { Message } from "@/lib/mockData";

interface ChatBubbleProps {
  message: Message;
  index: number;
}

export default function ChatBubble({ message, index }: ChatBubbleProps) {
  const isUser = message.sender === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className={`flex gap-4 px-4 py-5 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"} w-full max-w-3xl`}>
        {/* Avatar */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            isUser
              ? "bg-gradient-to-br from-blue-500 to-indigo-600"
              : "bg-gradient-to-br from-emerald-500 to-teal-600"
          }`}
        >
          {isUser ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Bot className="h-4 w-4 text-white" />
          )}
        </div>

        {/* Content */}
        <div className={`min-w-0 flex-1 ${isUser ? "flex flex-col items-end" : ""}`}>
          <p className="text-[15px] leading-relaxed text-gray-900 dark:text-gray-100">
            {message.text}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
