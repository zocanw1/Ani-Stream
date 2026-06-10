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
    <section className="glass relative overflow-hidden rounded-[22px] p-6 sm:p-8">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-[4px] border-[#1E1B29] bg-[#FDCB6E]" />
      <div className="relative space-y-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#6C5CE7]">Account</p>
          <h2 className="font-display mt-2 text-2xl font-black text-[#1E1B29]">
            {mode === "login" ? "Masuk ke akun" : "Buat akun baru"}
          </h2>
          <p className="mt-2 text-xs font-extrabold leading-6 text-[#1E1B29]/75">
            {mode === "login"
              ? "Gunakan akun AniStream kamu untuk membuka history."
              : "Daftar cepat dengan email dan password minimal 6 karakter."}
          </p>
        </div>

        <div className="grid grid-cols-2 rounded-2xl border-[3px] border-[#1E1B29] bg-[#FAF9FF] p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={`rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all ${
              mode === "login" ? "bg-[#00CEC9] text-[#1E1B29] shadow-[3px_3px_0_#1E1B29]" : "text-[#1E1B29] hover:bg-white"
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
              mode === "register" ? "bg-[#FF7675] text-white shadow-[3px_3px_0_#1E1B29]" : "text-[#1E1B29] hover:bg-white"
            }`}
          >
            Daftar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1E1B29]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@email.com"
              autoComplete="email"
              className="w-full rounded-2xl border-[3px] border-[#1E1B29] bg-white px-4 py-4 text-sm font-black text-[#1E1B29] placeholder-[#1E1B29]/45 outline-none transition-all focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[5px_5px_0_#1E1B29]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1E1B29]">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimal 6 karakter"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="w-full rounded-2xl border-[3px] border-[#1E1B29] bg-white px-4 py-4 pr-20 text-sm font-black text-[#1E1B29] placeholder-[#1E1B29]/45 outline-none transition-all focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[5px_5px_0_#1E1B29]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-3 my-auto h-9 rounded-xl px-3 text-[10px] font-black uppercase tracking-widest text-[#1E1B29] hover:bg-[#FDCB6E]"
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
