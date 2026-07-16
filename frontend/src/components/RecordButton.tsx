"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Loader2, Volume2 } from "lucide-react";

export type RecordingState = "idle" | "recording" | "processing" | "speaking";

interface RecordButtonProps {
  state: RecordingState;
  onClick: () => void;
}

const stateConfig = {
  idle: {
    label: "Tap to Speak",
    color: "from-blue-500 to-purple-600",
    shadow: "shadow-blue-500/30",
    ring: "ring-blue-500/20",
  },
  recording: {
    label: "Listening...",
    color: "from-red-500 to-pink-600",
    shadow: "shadow-red-500/40",
    ring: "ring-red-500/30",
  },
  processing: {
    label: "Thinking...",
    color: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-500/30",
    ring: "ring-amber-500/20",
  },
  speaking: {
    label: "Speaking...",
    color: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/30",
    ring: "ring-emerald-500/20",
  },
};

export default function RecordButton({ state, onClick }: RecordButtonProps) {
  const config = stateConfig[state];
  const isActive = state !== "idle";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Pulse rings for recording */}
      <div className="relative">
        <AnimatePresence>
          {state === "recording" && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.6,
                    ease: "easeOut",
                  }}
                  className="absolute inset-0 rounded-full border-2 border-red-400"
                  style={{
                    width: "100%",
                    height: "100%",
                    left: 0,
                    top: 0,
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Main button */}
        <motion.button
          onClick={onClick}
          whileHover={{ scale: isActive ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={
            state === "recording"
              ? { scale: [1, 1.08, 1] }
              : state === "processing"
              ? { rotate: 360 }
              : {}
          }
          transition={
            state === "recording"
              ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
              : state === "processing"
              ? { duration: 1.5, repeat: Infinity, ease: "linear" }
              : {}
          }
          className={`relative z-10 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br ${config.color} shadow-2xl ${config.shadow} ring-4 ${config.ring} transition-all`}
          aria-label={config.label}
        >
          {state === "idle" && <Mic className="h-10 w-10 text-white" />}
          {state === "recording" && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <MicOff className="h-10 w-10 text-white" />
            </motion.div>
          )}
          {state === "processing" && (
            <Loader2 className="h-10 w-10 text-white animate-spin" />
          )}
          {state === "speaking" && (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              <Volume2 className="h-10 w-10 text-white" />
            </motion.div>
          )}
        </motion.button>
      </div>

      {/* Label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={state}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-sm font-medium text-gray-600 dark:text-gray-300"
        >
          {config.label}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
