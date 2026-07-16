"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="py-4 text-center"
    >
      <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
        Powered by{" "}
        <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Hadiqa Gohar
        </span>
        <Heart className="h-3 w-3 text-pink-400" fill="currentColor" />
      </p>
    </motion.footer>
  );
}
