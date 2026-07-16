"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MessageSquare,
  Mic,
  Volume2,
  Globe,
  Users,
  TrendingUp,
  Calendar,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import type { DashboardData } from "@/lib/types";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="gradient-bg flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="gradient-bg flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Failed to load dashboard</p>
      </div>
    );
  }

  const statCards = [
    { label: "Total Conversations", value: data.total_conversations, icon: MessageSquare, color: "from-blue-500 to-cyan-500" },
    { label: "Total Messages", value: data.total_messages, icon: TrendingUp, color: "from-purple-500 to-pink-500" },
    { label: "Today's Conversations", value: data.conversations_today, icon: Calendar, color: "from-emerald-500 to-teal-500" },
    { label: "Today's Messages", value: data.messages_today, icon: Mic, color: "from-amber-500 to-orange-500" },
    { label: "TTS Requests", value: data.total_tts_requests, icon: Volume2, color: "from-red-500 to-rose-500" },
    { label: "Languages Used", value: Object.keys(data.language_stats).length, icon: Globe, color: "from-indigo-500 to-violet-500" },
  ];

  const maxDaily = Math.max(...data.daily_activity.map((d) => d.messages), 1);

  return (
    <div className="gradient-bg flex min-h-screen flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/chat" className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Chat</span>
          </Link>
          <h1 className="text-sm font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <Link href="/tts" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
            TTS Converter
          </Link>
        </div>
      </nav>

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {statCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-black/5 bg-white/70 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
              >
                <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${card.color}`}>
                  <card.icon className="h-4 w-4 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">{card.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Daily Activity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-black/5 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
            >
              <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Messages (Last 7 Days)</h3>
              <div className="flex items-end gap-2 h-40">
                {data.daily_activity.map((day) => (
                  <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-400">{day.messages}</span>
                    <div className="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-purple-500 transition-all" style={{ height: `${(day.messages / maxDaily) * 100}%`, minHeight: day.messages > 0 ? "4px" : "0" }} />
                    <span className="text-[10px] text-gray-400">{day.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Language Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl border border-black/5 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
            >
              <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Language Usage</h3>
              {Object.keys(data.language_stats).length === 0 ? (
                <p className="text-xs text-gray-400">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(data.language_stats)
                    .sort(([, a], [, b]) => b.count - a.count)
                    .map(([lang, stats]) => {
                      const total = Object.values(data.language_stats).reduce((s, l) => s + l.count, 0);
                      const pct = total > 0 ? (stats.count / total) * 100 : 0;
                      return (
                        <div key={lang}>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{lang.toUpperCase()}</span>
                            <span className="text-gray-400">{stats.count} ({pct.toFixed(0)}%)</span>
                          </div>
                          <div className="mt-1 h-2 rounded-full bg-gray-100 dark:bg-white/10">
                            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </motion.div>

            {/* Interaction Types */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl border border-black/5 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
            >
              <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Interaction Types</h3>
              {Object.keys(data.interaction_stats).length === 0 ? (
                <p className="text-xs text-gray-400">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(data.interaction_stats)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, count]) => {
                      const total = Object.values(data.interaction_stats).reduce((s, c) => s + c, 0);
                      const pct = total > 0 ? (count / total) * 100 : 0;
                      const colors: Record<string, string> = {
                        voice: "from-blue-500 to-cyan-500",
                        text: "from-purple-500 to-pink-500",
                        file_upload: "from-amber-500 to-orange-500",
                        tts_convert: "from-emerald-500 to-teal-500",
                      };
                      return (
                        <div key={type}>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{type.replace("_", " ")}</span>
                            <span className="text-gray-400">{count} ({pct.toFixed(0)}%)</span>
                          </div>
                          <div className="mt-1 h-2 rounded-full bg-gray-100 dark:bg-white/10">
                            <div className={`h-full rounded-full bg-gradient-to-r ${colors[type] || "from-gray-400 to-gray-500"}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </motion.div>

            {/* Voice Gender */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-xl border border-black/5 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
            >
              <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Voice Gender Preference</h3>
              {Object.keys(data.gender_stats).length === 0 ? (
                <p className="text-xs text-gray-400">No data yet</p>
              ) : (
                <div className="flex items-center gap-6">
                  {Object.entries(data.gender_stats).map(([gender, count]) => {
                    const total = Object.values(data.gender_stats).reduce((s, c) => s + c, 0);
                    const pct = total > 0 ? (count / total) * 100 : 0;
                    return (
                      <div key={gender} className="flex flex-col items-center gap-2">
                        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${gender === "female" ? "bg-pink-500/20 text-pink-500" : "bg-blue-500/20 text-blue-500"}`}>
                          <Users className="h-6 w-6" />
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{pct.toFixed(0)}%</p>
                        <p className="text-[10px] text-gray-400 capitalize">{gender}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
