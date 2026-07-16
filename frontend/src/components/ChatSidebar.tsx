"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MessageSquare,
  Settings,
  ChevronLeft,
  Search,
  Trash2,
  Volume2,
  BarChart3,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import type { Conversation } from "@/lib/types";

interface ChatSidebarProps {
  open: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectConversation: (id: number) => void;
}

export default function ChatSidebar({
  open,
  onClose,
  onNewChat,
  onSelectConversation,
}: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listConversations();
      setConversations(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchConversations();
    }
  }, [open, fetchConversations]);

  const handleNewChat = () => {
    onNewChat();
    fetchConversations();
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // ignore
    }
  };

  const groupConversations = (convs: Conversation[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const weekAgo = new Date(today.getTime() - 7 * 86400000);

    const groups: Record<string, Conversation[]> = {
      Today: [],
      Yesterday: [],
      "Previous 7 Days": [],
      Older: [],
    };

    for (const conv of convs) {
      const d = new Date(conv.updated_at);
      if (d >= today) groups["Today"].push(conv);
      else if (d >= yesterday) groups["Yesterday"].push(conv);
      else if (d >= weekAgo) groups["Previous 7 Days"].push(conv);
      else groups["Older"].push(conv);
    }

    return Object.entries(groups).filter(([, items]) => items.length > 0);
  };

  const grouped = groupConversations(conversations);

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: open ? 260 : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="relative z-50 flex h-full flex-col overflow-hidden border-r border-black/5 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-black/20 shrink-0"
      >
        {/* Top actions */}
        <div className="flex items-center justify-between p-3">
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white">
            <Search className="h-5 w-5" />
          </button>
        </div>

        {/* New Chat button */}
        <div className="px-3 pb-2">
          <button
            onClick={handleNewChat}
            className="flex w-full items-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
            New chat
          </button>
        </div>

        {/* Quick nav */}
        <div className="px-3 pb-2 flex gap-2">
          <Link
            href="/tts"
            className="flex flex-1 items-center gap-2 rounded-lg border border-black/5 bg-white/50 px-3 py-2 text-xs text-gray-600 transition-colors hover:bg-white dark:border-white/5 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
          >
            <Volume2 className="h-3.5 w-3.5" />
            TTS
          </Link>
          <Link
            href="/dashboard"
            className="flex flex-1 items-center gap-2 rounded-lg border border-black/5 bg-white/50 px-3 py-2 text-xs text-gray-600 transition-colors hover:bg-white dark:border-white/5 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Stats
          </Link>
        </div>

        {/* History */}
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {loading && conversations.length === 0 && (
            <div className="px-2 pt-4 text-xs text-gray-400 dark:text-gray-500">
              Loading...
            </div>
          )}
          {!loading && conversations.length === 0 && (
            <div className="px-2 pt-4 text-xs text-gray-400 dark:text-gray-500">
              No conversations yet
            </div>
          )}
          {grouped.map(([group, convs]) => (
            <div key={group} className="mb-2">
              <p className="px-2 pb-1 pt-3 text-xs font-semibold text-gray-400 dark:text-gray-500">
                {group}
              </p>
              {convs.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  onMouseEnter={() => setHoveredId(conv.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="group relative flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-gray-700 transition-colors hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  <MessageSquare className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                  <span className="flex-1 truncate">{conv.title}</span>

                  {/* Hover actions */}
                  <AnimatePresence>
                    {hoveredId === conv.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute right-1 flex items-center gap-0.5 rounded-lg bg-white/80 backdrop-blur-sm p-0.5 shadow-lg dark:bg-black/40"
                      >
                        <button
                          onClick={(e) => handleDelete(conv.id, e)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom user section */}
        <div className="border-t border-black/10 p-3 dark:border-white/10">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                {user?.username || "User"}
              </p>
              <p className="text-xs text-gray-400 truncate dark:text-gray-500">
                {user?.email || "Voice Assistant"}
              </p>
            </div>
            <button
              onClick={() => { logout(); router.push("/login"); }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
