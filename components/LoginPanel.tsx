"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
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
    <section className="rounded-lg border border-white/10 bg-[#111416] p-6 shadow-2xl sm:p-8">
      <p className="text-[10px] font-black uppercase text-[#ef1b24]">Account</p>
      <h2 className="mt-2 text-2xl font-black">{mode === "login" ? "Masuk ke AniStream" : "Buat akun AniStream"}</h2>
      <p className="mt-2 text-xs font-bold leading-6 text-neutral-500">{mode === "login" ? "Buka history dan lanjutkan episode terakhir." : "Daftar dengan email dan password minimal 6 karakter."}</p>

      <div className="mt-6 grid grid-cols-2 rounded-md border border-white/10 bg-black/35 p-1">
        <button type="button" onClick={() => selectMode("login")} className={`rounded py-3 text-xs font-black ${mode === "login" ? "bg-white text-black" : "text-neutral-400 hover:text-white"}`}>Masuk</button>
        <button type="button" onClick={() => selectMode("register")} className={`rounded py-3 text-xs font-black ${mode === "register" ? "bg-[#ef1b24] text-white" : "text-neutral-400 hover:text-white"}`}>Daftar</button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-[10px] font-black uppercase text-neutral-400">Email</span>
          <span className="mt-2 flex items-center gap-3 rounded-md border border-white/10 bg-black/35 px-4 focus-within:border-white/35">
            <Mail size={17} className="text-neutral-600" />
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" autoComplete="email" className="min-w-0 flex-1 bg-transparent py-4 text-sm font-bold text-white outline-none placeholder:text-neutral-700" />
          </span>
        </label>
        <label className="block">
          <span className="text-[10px] font-black uppercase text-neutral-400">Password</span>
          <span className="mt-2 flex items-center gap-3 rounded-md border border-white/10 bg-black/35 px-4 focus-within:border-white/35">
            <LockKeyhole size={17} className="text-neutral-600" />
            <input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimal 6 karakter" autoComplete={mode === "login" ? "current-password" : "new-password"} className="min-w-0 flex-1 bg-transparent py-4 text-sm font-bold text-white outline-none placeholder:text-neutral-700" />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="icon-button h-9 w-9 rounded text-neutral-500 hover:bg-white/10 hover:text-white" aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
          </span>
        </label>
        {error && <div className="rounded-md border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-300" role="alert">{error}</div>}
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50">{loading && <LoaderCircle size={17} className="animate-spin" />}{loading ? "Memproses..." : mode === "login" ? "Masuk Sekarang" : "Buat Akun"}</button>
      </form>
    </section>
  );
}
