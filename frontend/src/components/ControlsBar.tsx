"use client";

import { motion } from "framer-motion";
import {
  ToggleLeft,
  ToggleRight,
  Mic,
  Pause,
  RotateCcw,
  Trash2,
  Volume2,
} from "lucide-react";

interface ControlsBarProps {
  mode: "local" | "api";
  onToggleMode: () => void;
  onClearChat: () => void;
}

export default function ControlsBar({
  mode,
  onToggleMode,
  onClearChat,
}: ControlsBarProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl dark:bg-black/20 sm:gap-4"
    >
      {/* Local/API Toggle */}
      <button
        onClick={onToggleMode}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-gray-700 backdrop-blur-sm transition-all hover:bg-white/20 dark:text-gray-200"
      >
        {mode === "local" ? (
          <ToggleLeft className="h-4 w-4 text-blue-400" />
        ) : (
          <ToggleRight className="h-4 w-4 text-purple-400" />
        )}
        {mode === "local" ? "Local" : "API"}
      </button>

      {/* Voice Selection */}
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs backdrop-blur-sm">
        <Volume2 className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
        <select className="bg-transparent text-xs font-medium text-gray-700 outline-none dark:text-gray-200">
          <option value="female">Female Voice</option>
          <option value="male">Male Voice</option>
        </select>
      </div>

      {/* Playback buttons (disabled/dummy) */}
      <div className="flex items-center gap-1">
        <button
          disabled
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 opacity-40 dark:text-gray-500"
          title="Pause"
        >
          <Pause className="h-3.5 w-3.5" />
        </button>
        <button
          disabled
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 opacity-40 dark:text-gray-500"
          title="Replay"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Clear Chat */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClearChat}
        className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-500 backdrop-blur-sm transition-all hover:bg-red-500/20"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Clear
      </motion.button>
    </motion.div>
  );
}
