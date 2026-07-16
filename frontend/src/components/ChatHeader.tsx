"use client";

import { motion } from "framer-motion";
import { Menu, Share2, Sun, Moon } from "lucide-react";
import { useState } from "react";

interface ChatHeaderProps {
  onToggleSidebar: () => void;
}

export default function ChatHeader({ onToggleSidebar }: ChatHeaderProps) {
  const [darkMode, setDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-white/10 bg-[#212121] px-4">
      <button
        onClick={onToggleSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <button className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </button>
        <button
          onClick={toggleDarkMode}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
