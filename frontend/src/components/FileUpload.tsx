"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileAudio, X, Check, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { LanguageCode, TranscriptionResult } from "@/lib/types";

interface FileUploadProps {
  language: LanguageCode;
  onTranscription: (text: string) => void;
}

export default function FileUpload({ language, onTranscription }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("audio/")) {
      setError("Please upload an audio file");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const transcription = await api.transcribeFile(file, "local", language);
      setResult(transcription);
      onTranscription(transcription.transcript);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transcription failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      <motion.div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all ${
          isDragging
            ? "border-blue-500 bg-blue-500/10"
            : isProcessing
            ? "border-amber-500/50 bg-amber-500/5"
            : "border-black/10 bg-white/5 hover:border-blue-400/50 hover:bg-blue-500/5 dark:border-white/10 dark:hover:border-blue-400/50"
        }`}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Transcribing...</p>
          </div>
        ) : result ? (
          <div className="flex flex-col items-center gap-2">
            <Check className="h-8 w-8 text-green-500" />
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {result.transcript}
            </p>
            <p className="text-[10px] text-gray-400">
              {result.filename} • {(result.file_size_bytes / 1024).toFixed(1)}KB • {result.processing_time_ms.toFixed(0)}ms
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Drop audio file or click to upload
              </p>
              <p className="text-[10px] text-gray-400">
                Supports WAV, MP3, WebM, OGG, FLAC
              </p>
            </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-500"
          >
            <X className="h-3 w-3" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto underline">
              dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
