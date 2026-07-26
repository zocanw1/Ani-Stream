import { Sparkles, History, Clock3, Layers3 } from "lucide-react";
import { redirect } from "next/navigation";

import LoginPanel from "@/components/LoginPanel";
import { getCurrentUser } from "@/lib/auth";
import { normalizeNextPath } from "@/lib/navigation";

export const metadata = { title: "Masuk - AniStream" };

const benefits = [
  { icon: History, title: "Lanjutkan anime", text: "Kembali ke judul terakhir yang ditonton." },
  { icon: Clock3, title: "Timeline episode", text: "Riwayat episode tersusun dari yang terbaru." },
  { icon: Layers3, title: "Dua sumber", text: "Samehadaku dan Otakudesu dalam satu akun." },
];

export default async function LoginPage(props: { searchParams: Promise<{ next?: string; mode?: string }> }) {
  const searchParams = await props.searchParams;
  const nextPath = normalizeNextPath(searchParams.next, "/");
  const mode = searchParams.mode === "register" ? "register" : "login";
  const user = await getCurrentUser();
  if (user) redirect(nextPath);

  return (
    <div className="min-h-screen bg-[var(--bg-deep)]">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-[0.04] blur-3xl" style={{background: "var(--primary)"}} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-[0.04] blur-3xl" style={{background: "var(--secondary)"}} />
      </div>

      <div className="relative px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_430px]">
          <section className="max-w-xl mx-auto lg:mx-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 border border-[var(--border-glow)] text-[10px] font-black uppercase tracking-[0.15em] mb-4" style={{color: "var(--primary)"}}>
              <Sparkles size={12} /> AniStream Account
            </div>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl text-gradient-anime">
              Satu akun untuk melanjutkan semua tontonan.
            </h1>
            <p className="mt-5 max-w-2xl text-sm font-bold leading-7 text-[var(--text-secondary)] sm:text-base">
              Masuk untuk menyimpan riwayat anime dan episode dari dua sumber AniStream.
            </p>
            <div className="mt-9 grid max-w-3xl gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
              {benefits.map(({ icon: Icon, title, text }) => (
                <div key={title} className="p-6 transition-colors hover:bg-white/[0.02]" style={{background: "var(--bg-surface)"}}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/20 border border-[var(--border-glow)]" style={{color: "var(--primary)"}}>
                    <Icon size={18} />
                  </div>
                  <h2 className="mt-4 text-sm font-black">{title}</h2>
                  <p className="mt-2 text-xs font-bold leading-5 text-[var(--text-dim)]">{text}</p>
                </div>
              ))}
            </div>
          </section>
          <LoginPanel initialMode={mode} nextPath={nextPath} />
        </div>
      </div>
    </div>
  );
}
