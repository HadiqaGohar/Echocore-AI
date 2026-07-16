"use client";

import { motion } from "framer-motion";
import { ToggleLeft, ToggleRight, Pause, RotateCcw, Trash2, Volume2 } from "lucide-react";

interface ControlsBarProps {
  mode: "local" | "api";
  onToggleMode: () => void;
  onClearChat: () => void;
}

export default function ControlsBar({ mode, onToggleMode, onClearChat }: ControlsBarProps) {
  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex flex-wrap items-center justify-center gap-2"
    >
      <button
        onClick={onToggleMode}
        className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
      >
        {mode === "local" ? (
          <ToggleLeft className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
        ) : (
          <ToggleRight className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" />
        )}
        {mode === "local" ? "Local" : "API"}
      </button>

      <div className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
        <Volume2 className="h-3.5 w-3.5" />
        <select className="bg-transparent text-xs outline-none">
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
      </div>

      <button disabled className="flex h-7 w-7 items-center justify-center rounded-full text-gray-300 opacity-40 dark:text-gray-600" title="Pause">
        <Pause className="h-3.5 w-3.5" />
      </button>
      <button disabled className="flex h-7 w-7 items-center justify-center rounded-full text-gray-300 opacity-40 dark:text-gray-600" title="Replay">
        <RotateCcw className="h-3.5 w-3.5" />
      </button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClearChat}
        className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Clear
      </motion.button>
    </motion.div>
  );
}
