"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ChevronLeft, ChevronRight, Clock } from "lucide-react";

interface ConversationEntry {
  id: string;
  title: string;
  timestamp: Date;
}

const mockConversations: ConversationEntry[] = [
  { id: "1", title: "What is quantum computing?", timestamp: new Date(Date.now() - 3600000) },
  { id: "2", title: "Recipe for chocolate cake", timestamp: new Date(Date.now() - 7200000) },
  { id: "3", title: "Benefits of meditation", timestamp: new Date(Date.now() - 86400000) },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <>
      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCollapsed(!collapsed)}
        className="fixed left-0 top-1/2 z-50 flex h-12 w-6 -translate-y-1/2 items-center justify-center rounded-r-xl border border-l-0 border-white/10 bg-white/10 backdrop-blur-xl transition-colors hover:bg-white/20 dark:bg-black/20"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        )}
      </motion.button>

      {/* Sidebar panel */}
      <AnimatePresence>
        {!collapsed && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-72 flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl dark:bg-black/20"
          >
            <div className="p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                <Clock className="h-4 w-4" />
                History
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
              {mockConversations.map((conv) => (
                <button
                  key={conv.id}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/10 dark:hover:bg-white/5"
                >
                  <MessageSquare className="h-4 w-4 shrink-0 text-gray-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-gray-700 dark:text-gray-300">
                      {conv.title}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      {conv.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
