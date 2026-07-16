"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import ChatBubble from "./ChatBubble";
import type { Message } from "@/lib/types";

interface ChatWindowProps {
  messages: Message[];
}

export default function ChatWindow({ messages }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <ChatBubble key={msg.id} message={msg} index={i} />
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
