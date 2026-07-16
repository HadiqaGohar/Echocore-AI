"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, LogIn } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/authContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { access_token } = await api.login(username, password);
      const payload = JSON.parse(atob(access_token.split(".")[1]));
      login(access_token, { id: Number(payload.sub), username: payload.username, email: "" });
      router.push("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="rounded-2xl border border-black/5 bg-white/70 p-8 backdrop-blur-xl shadow-xl dark:border-white/10 dark:bg-white/5">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">EchoCore</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Enter password"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-blue-500 hover:text-blue-600">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
