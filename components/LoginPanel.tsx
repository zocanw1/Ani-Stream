"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

type LoginPanelProps = { initialMode: "login" | "register"; nextPath: string };

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
    if (!email.trim()) return setError("Email wajib diisi.");
    if (password.length < 6) return setError("Password minimal 6 karakter.");

    setLoading(true);
    const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) return setError(json.error || "Gagal memproses akun.");
    router.replace(nextPath);
    router.refresh();
  }

  function selectMode(value: "login" | "register") {
    setMode(value);
    setError("");
  }

  return (
    <section className="relative rounded-2xl border p-8 shadow-2xl sm:p-10 overflow-hidden" style={{borderColor: "var(--border)", background: "var(--bg-glass)"}}>
      {/* Decorative glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-[0.06] blur-3xl pointer-events-none" style={{background: "var(--primary)"}} />

      <div className="relative">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary)]/10 border border-[var(--border-glow)] text-[10px] font-black uppercase tracking-[0.15em] mb-3" style={{color: "var(--primary)"}}>
          <Sparkles size={12} /> Account
        </div>
        <h2 className="mt-2 text-2xl font-black">{mode === "login" ? "Masuk ke AniStream" : "Buat akun AniStream"}</h2>
        <p className="mt-2 text-xs font-bold leading-6 text-[var(--text-dim)]">
          {mode === "login" ? "Buka history dan lanjutkan episode terakhir." : "Daftar dengan email dan password minimal 6 karakter."}
        </p>

        <div className="mt-6 grid grid-cols-2 rounded-xl border border-white/10 bg-black/35 p-1">
          <button
            type="button"
            onClick={() => selectMode("login")}
            className={`rounded-lg py-3 text-xs font-black transition-all ${
              mode === "login"
                ? "bg-white text-black shadow-lg"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => selectMode("register")}
            className="rounded-lg py-3 text-xs font-black transition-all"
            style={mode === "register" ? {
              background: "linear-gradient(135deg, var(--primary), var(--secondary))",
              color: "white",
              boxShadow: "0 0 16px var(--primary-glow)",
            } : {color: "var(--text-dim)"}}
          >
            Daftar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-[10px] font-black uppercase text-neutral-400">Email</span>
            <span className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-black/35 px-4 focus-within:border-[var(--primary)]/50 transition-colors">
              <Mail size={17} className="text-neutral-600" />
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" autoComplete="email" className="min-w-0 flex-1 bg-transparent py-4 text-sm font-bold text-white outline-none placeholder:text-neutral-700" />
            </span>
          </label>
          <label className="block">
            <span className="text-[10px] font-black uppercase text-neutral-400">Password</span>
            <span className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-black/35 px-4 focus-within:border-[var(--primary)]/50 transition-colors">
              <LockKeyhole size={17} className="text-neutral-600" />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimal 6 karakter" autoComplete={mode === "login" ? "current-password" : "new-password"} className="min-w-0 flex-1 bg-transparent py-4 text-sm font-bold text-white outline-none placeholder:text-neutral-700" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="icon-button h-9 w-9 rounded text-neutral-500 hover:bg-white/10 hover:text-white" aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>

          {error && (
            <div className="rounded-xl border px-4 py-3 text-xs font-bold text-red-300" role="alert" style={{
              borderColor: "rgba(239,27,36,0.25)",
              background: "rgba(239,27,36,0.1)",
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full disabled:cursor-not-allowed disabled:opacity-50 btn-glow py-4 rounded-xl text-xs font-black uppercase tracking-[0.15em]">
            {loading && <LoaderCircle size={17} className="animate-spin" />}
            {loading ? "Memproses..." : mode === "login" ? "Masuk Sekarang" : "Buat Akun"}
          </button>
        </form>
      </div>
    </section>
  );
}
