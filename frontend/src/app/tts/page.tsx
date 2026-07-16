"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Download, Volume2, Loader2, Copy, Check, Sun, Moon } from "lucide-react";
import { api } from "@/lib/api";
import { useDarkMode } from "@/lib/darkModeContext";
import LanguageSelector from "@/components/LanguageSelector";
import type { LanguageCode, VoiceGender } from "@/lib/types";

export default function TTSPage() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [voiceGender, setVoiceGender] = useState<VoiceGender>("female");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { darkMode, toggleDarkMode } = useDarkMode();

  const handlePlay = async () => {
    if (!text.trim()) return;
    setIsPlaying(true);
    try {
      const blob = await api.convertTTS(text, language, voiceGender);
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      await audio.play();
    } catch {
      setIsPlaying(false);
    }
  };

  const handleDownload = async () => {
    if (!text.trim()) return;
    setIsDownloading(true);
    try {
      await api.downloadTTS(text, language, voiceGender);
    } catch {
      // error handled
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="gradient-bg flex min-h-screen flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/chat" className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Chat</span>
          </Link>
          <h1 className="text-sm font-bold text-gray-900 dark:text-white">TTS Converter</h1>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
              Dashboard
            </Link>
            <button onClick={toggleDarkMode} className="rounded-lg p-2 text-gray-500 hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/10">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </nav>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="rounded-2xl border border-black/5 bg-white/70 p-6 backdrop-blur-xl shadow-xl dark:border-white/10 dark:bg-white/5">
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                <Volume2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Text to Speech</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Convert any text to natural-sounding speech</p>
              </div>
            </div>

            {/* Text input */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste text to convert to speech..."
              rows={5}
              className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
            />

            <div className="mt-2 flex items-center justify-between">
              <p className="text-[10px] text-gray-400">{text.length} / 5000 characters</p>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            {/* Language & Voice */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <LanguageSelector
                language={language}
                voiceGender={voiceGender}
                onLanguageChange={setLanguage}
                onGenderChange={setVoiceGender}
              />
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlay}
                disabled={!text.trim() || isPlaying}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 disabled:opacity-50"
              >
                {isPlaying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isPlaying ? "Playing..." : "Play"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownload}
                disabled={!text.trim() || isDownloading}
                className="flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download
              </motion.button>
            </div>

            {/* Features */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { label: "10+ Languages", desc: "Hindi, Urdu, English & more" },
                { label: "Male & Female", desc: "Neural voice options" },
                { label: "Free & Fast", desc: "No API key needed" },
              ].map((f) => (
                <div key={f.label} className="rounded-lg bg-black/5 p-3 text-center dark:bg-white/5">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">{f.label}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
