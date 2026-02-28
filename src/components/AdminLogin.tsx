import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Lock, ArrowRight } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("adminToken", data.token);
        navigate("/admin/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-neutral-900 border border-white/10 p-8 rounded-2xl shadow-2xl"
      >
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
            <Lock className="w-5 h-5 text-white/70" />
          </div>
        </div>

        <h2 className="text-2xl text-white font-light text-center mb-2">
          Admin Access
        </h2>
        <p className="text-neutral-500 text-sm text-center mb-8 font-mono">
          Enter your password to manage the gallery.
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs font-mono text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black rounded-xl px-4 py-3 font-medium flex items-center justify-center space-x-2 hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Enter Dashboard"}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-neutral-500 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors"
          >
            Return to Gallery
          </button>
        </div>
      </motion.div>
    </div>
  );
}
