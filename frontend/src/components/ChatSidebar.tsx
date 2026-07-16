"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MessageSquare,
  Settings,
  ChevronLeft,
  Search,
  MoreHorizontal,
  Trash2,
  Edit3,
} from "lucide-react";

interface ConversationEntry {
  id: string;
  title: string;
  timestamp: Date;
  group: string;
}

const mockConversations: ConversationEntry[] = [
  { id: "1", title: "What is quantum computing?", timestamp: new Date(), group: "Today" },
  { id: "2", title: "Recipe for chocolate cake", timestamp: new Date(), group: "Today" },
  { id: "3", title: "Benefits of meditation", timestamp: new Date(Date.now() - 86400000), group: "Yesterday" },
  { id: "4", title: "How does neural network work?", timestamp: new Date(Date.now() - 86400000), group: "Yesterday" },
  { id: "5", title: "Python vs JavaScript comparison", timestamp: new Date(Date.now() - 172800000), group: "Previous 7 Days" },
  { id: "6", title: "Best practices for API design", timestamp: new Date(Date.now() - 259200000), group: "Previous 7 Days" },
  { id: "7", title: "Explain Docker containers", timestamp: new Date(Date.now() - 259200000), group: "Previous 7 Days" },
  { id: "8", title: "What is machine learning?", timestamp: new Date(Date.now() - 604800000), group: "Previous 30 Days" },
  { id: "9", title: "Linux command cheatsheet", timestamp: new Date(Date.now() - 604800000), group: "Previous 30 Days" },
];

interface ChatSidebarProps {
  open: boolean;
  onClose: () => void;
  onNewChat: () => void;
}

export default function ChatSidebar({ open, onClose, onNewChat }: ChatSidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const grouped = mockConversations.reduce<Record<string, ConversationEntry[]>>(
    (acc, conv) => {
      if (!acc[conv.group]) acc[conv.group] = [];
      acc[conv.group].push(conv);
      return acc;
    },
    {}
  );

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
            onClick={onNewChat}
            className="flex w-full items-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
            New chat
          </button>
        </div>

        {/* History */}
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {Object.entries(grouped).map(([group, convs]) => (
            <div key={group} className="mb-2">
              <p className="px-2 pb-1 pt-3 text-xs font-semibold text-gray-400 dark:text-gray-500">
                {group}
              </p>
              {convs.map((conv) => (
                <div
                  key={conv.id}
                  onMouseEnter={() => setHoveredId(conv.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="group relative flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-gray-700 transition-colors hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/5"
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
                        <button className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-black/5 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white">
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-black/5 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <button className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-black/5 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white">
                          <MoreHorizontal className="h-3.5 w-3.5" />
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
              HG
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                Hadiqa Gohar
              </p>
              <p className="text-xs text-gray-400 truncate dark:text-gray-500">Free Plan</p>
            </div>
            <button className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-black/5 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
