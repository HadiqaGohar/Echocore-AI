"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronDown, User, Users } from "lucide-react";
import { LANGUAGES, type LanguageCode, type VoiceGender } from "@/lib/types";

interface LanguageSelectorProps {
  language: LanguageCode;
  voiceGender: VoiceGender;
  onLanguageChange: (lang: LanguageCode) => void;
  onGenderChange: (gender: VoiceGender) => void;
}

export default function LanguageSelector({
  language,
  voiceGender,
  onLanguageChange,
  onGenderChange,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.nativeName}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 z-50 mb-2 w-56 overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-[#1a1a1a]"
          >
            {/* Voice gender toggle */}
            <div className="flex border-b border-black/5 p-2 dark:border-white/5">
              <button
                onClick={() => onGenderChange("female")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  voiceGender === "female"
                    ? "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
                    : "text-gray-500 hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/5"
                }`}
              >
                <User className="h-3 w-3" />
                Female
              </button>
              <button
                onClick={() => onGenderChange("male")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  voiceGender === "male"
                    ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                    : "text-gray-500 hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/5"
                }`}
              >
                <Users className="h-3 w-3" />
                Male
              </button>
            </div>

            {/* Language list */}
            <div className="max-h-60 overflow-y-auto p-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onLanguageChange(lang.code);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    language === lang.code
                      ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                      : "text-gray-700 hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/5"
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{lang.nativeName}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      {lang.name}
                    </p>
                  </div>
                  {language === lang.code && (
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
