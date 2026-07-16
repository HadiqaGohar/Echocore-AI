"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mic,
  Brain,
  Volume2,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  MicOff,
  Sun,
  Moon,
  Heart,
  LogIn,
} from "lucide-react";
import { useDarkMode } from "@/lib/darkModeContext";
import { useAuth } from "@/lib/authContext";

export default function LandingPage() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { user } = useAuth();

  const features = [
    {
      icon: Mic,
      title: "Speech to Text",
      desc: "Speak naturally — our AI transcribes your voice instantly with pinpoint accuracy.",
      color: "from-blue-500 to-cyan-500",
      shadow: "shadow-blue-500/20",
    },
    {
      icon: Brain,
      title: "AI-Powered Replies",
      desc: "Powered by Gemini, OpenRouter & Ollama for intelligent, context-aware responses.",
      color: "from-purple-500 to-pink-500",
      shadow: "shadow-purple-500/20",
    },
    {
      icon: Volume2,
      title: "Text to Speech",
      desc: "Hear natural-sounding replies in real-time — no screen needed.",
      color: "from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-500/20",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      desc: "Optimized pipeline ensures minimal latency from voice input to spoken reply.",
      color: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/20",
    },
    {
      icon: Shield,
      title: "Private & Secure",
      desc: "Run fully local with faster-whisper and pyttsx3 — your data never leaves your device.",
      color: "from-red-500 to-rose-500",
      shadow: "shadow-red-500/20",
    },
    {
      icon: Globe,
      title: "Local or Cloud",
      desc: "Choose between offline processing or cloud APIs — you decide what works best.",
      color: "from-indigo-500 to-violet-500",
      shadow: "shadow-indigo-500/20",
    },
  ];

  const steps = [
    { num: "01", title: "Tap to Speak", desc: "Press the mic button and talk naturally" },
    { num: "02", title: "AI Listens", desc: "Your voice is transcribed to text instantly" },
    { num: "03", title: "AI Thinks", desc: "Gemini/LLM generates a smart response" },
    { num: "04", title: "AI Replies", desc: "Hear the answer spoken back to you" },
  ];

  return (
    <div className="gradient-bg flex min-h-screen flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              EchoCore
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/5 bg-black/5 backdrop-blur-sm transition-colors hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </motion.button>
            {user ? (
              <Link href="/chat">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40"
                >
                  Go to Chat
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 rounded-xl border border-black/10 bg-white/50 px-4 py-2.5 text-sm font-medium text-gray-700 backdrop-blur-sm transition-colors hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </motion.button>
                </Link>
                <Link href="/chat">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40"
                  >
                    Launch App
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/60 px-4 py-1.5 text-xs font-medium text-gray-600 backdrop-blur-sm dark:border-white/10 dark:bg-white/10 dark:text-gray-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            Now in Beta
          </div>

          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
            Talk to AI.
            <br />
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Hear it reply.
            </span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg">
            EchoCore is a voice-powered AI assistant. Speak naturally, get intelligent
            responses, and hear them spoken back — all in real-time.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/chat">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40"
              >
                <Mic className="h-5 w-5" />
                Start Talking
              </motion.button>
            </Link>
            <Link href="/tts">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white/60 px-8 py-4 text-base font-bold text-gray-800 backdrop-blur-sm transition-all hover:bg-white/80 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
              >
                TTS
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Hero Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative mt-16 flex items-center gap-6"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-black/5 bg-white/60 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-white/10">
            <MicOff className="h-8 w-8 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="flex h-14 items-center">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                className="mx-0.5 h-3 w-1 rounded-full bg-gradient-to-t from-blue-400 to-purple-400"
                style={{ height: `${12 + Math.sin(i * 1.5) * 8}px` }}
              />
            ))}
          </div>
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-black/5 bg-white/60 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-white/10">
            <Brain className="h-8 w-8 text-purple-500 dark:text-purple-400" />
          </div>
          <div className="flex h-14 items-center">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 + 0.5 }}
                className="mx-0.5 h-3 w-1 rounded-full bg-gradient-to-t from-purple-400 to-pink-400"
                style={{ height: `${12 + Math.cos(i * 1.5) * 8}px` }}
              />
            ))}
          </div>
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-black/5 bg-white/60 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-white/10">
            <Volume2 className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Four simple steps from voice to answer
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-2xl border border-black/5 bg-white/60 p-6 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <span className="mb-3 inline-block rounded-lg bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  {step.num}
                </span>
                <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Everything you need
            </h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Built with the best tools for voice AI
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group rounded-2xl border border-black/5 bg-white/60 p-6 backdrop-blur-xl transition-all hover:-translate-y-1 hover:bg-white/80 hover:shadow-xl dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} shadow-lg ${f.shadow}`}
                >
                  <f.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl rounded-3xl border border-black/5 bg-white/60 p-12 text-center backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
        >
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Ready to try it?
          </h2>
          <p className="mb-8 text-gray-600 dark:text-gray-400">
            Start a voice conversation with AI in seconds.
          </p>
          <Link href="/chat">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 px-10 py-4 text-lg font-bold text-white shadow-xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40"
            >
              <Mic className="h-5 w-5" />
              Launch EchoCore
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/5 py-8 dark:border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Mic className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">EchoCore</span>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            Powered by{" "}
            <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Hadiqa Gohar
            </span>
            <Heart className="h-3 w-3 text-pink-400" fill="currentColor" />
          </p>
        </div>
      </footer>
    </div>
  );
}
