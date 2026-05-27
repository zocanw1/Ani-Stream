"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type LoginPanelProps = {
  initialMode: "login" | "register";
  nextPath: string;
};

export default function LoginPanel({ initialMode, nextPath }: LoginPanelProps) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(json.error || "Gagal memproses akun.");
      return;
    }

    router.replace(nextPath);
    router.refresh();
  }

  return (
    <section className="glass relative overflow-hidden rounded-[28px] border border-white/10 p-6 shadow-2xl sm:p-8">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#6c5ce7]/20 blur-3xl" />
      <div className="relative space-y-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Account</p>
          <h2 className="mt-2 text-2xl font-black text-white">
            {mode === "login" ? "Masuk ke akun" : "Buat akun baru"}
          </h2>
          <p className="mt-2 text-xs font-bold leading-6 text-gray-500">
            {mode === "login"
              ? "Gunakan akun AniStream kamu untuk membuka history."
              : "Daftar cepat dengan email dan password minimal 6 karakter."}
          </p>
        </div>

        <div className="grid grid-cols-2 rounded-2xl border border-white/10 bg-black/20 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={`rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all ${
              mode === "login" ? "bg-[#6c5ce7] text-white shadow-lg shadow-[#6c5ce7]/20" : "text-gray-500 hover:text-white"
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
            }}
            className={`rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all ${
              mode === "register" ? "bg-[#6c5ce7] text-white shadow-lg shadow-[#6c5ce7]/20" : "text-gray-500 hover:text-white"
            }`}
          >
            Daftar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@email.com"
              autoComplete="email"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-bold text-white placeholder-gray-600 outline-none transition-all focus:border-[#6c5ce7]/50 focus:ring-2 focus:ring-[#6c5ce7]/30"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimal 6 karakter"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 pr-20 text-sm font-bold text-white placeholder-gray-600 outline-none transition-all focus:border-[#6c5ce7]/50 focus:ring-2 focus:ring-[#6c5ce7]/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-3 my-auto h-9 rounded-xl px-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-white/10 hover:text-white"
              >
                {showPassword ? "Tutup" : "Lihat"}
              </button>
            </div>
          </label>

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-xs font-black uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Memproses..." : mode === "login" ? "Masuk Sekarang" : "Buat Akun"}
          </button>
        </form>
      </div>
    </section>
  );
}
