"use client";

import { useState } from "react";
import { Menu, Share2, Sun, Moon, Copy, Check } from "lucide-react";
import { useDarkMode } from "@/lib/darkModeContext";
import { api } from "@/lib/api";

interface ChatHeaderProps {
  onToggleSidebar: () => void;
  shareId?: string | null;
}

export default function ChatHeader({ onToggleSidebar, shareId }: ChatHeaderProps) {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!shareId) return;
    const url = api.getShareUrl(shareId);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: open in new tab
      window.open(url, "_blank");
    }
  };

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-black/5 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-black/20 px-4">
      <button
        onClick={onToggleSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        {shareId && (
          <button
            onClick={handleShare}
            className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
            <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
          </button>
        )}
        <button
          onClick={toggleDarkMode}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          {darkMode ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
