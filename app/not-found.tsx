import Link from "next/link";
import { Home, Search, Sparkles } from "lucide-react";

export default function NotFoundPage() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="glass w-full max-w-xl overflow-hidden text-center">
        <div className="border-b border-white/5 px-8 py-12">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{border: "1px solid var(--border)", background: "rgba(255,255,255,0.05)"}}>
            <Search size={30} style={{color: "var(--text-dim)"}} aria-hidden="true" />
          </span>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 border border-[var(--border-glow)] text-[10px] font-black uppercase tracking-[0.15em] mt-6" style={{color: "var(--primary)"}}>
            <Sparkles size={12} /> 404
          </div>
          <h1 className="mt-3 text-2xl font-black text-white sm:text-3xl">Halaman Tidak Ditemukan</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
            Anime, episode, atau halaman yang kamu cari sudah tidak tersedia atau alamatnya tidak sesuai.
          </p>
        </div>

        <div className="flex flex-col gap-3 p-6 sm:flex-row sm:justify-center">
          <Link href="/" prefetch={false} className="btn-glow inline-flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-[0.15em]">
            <Home size={16} aria-hidden="true" />
            Kembali ke Beranda
          </Link>
          <Link href="/search" prefetch={false} className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-[0.15em]">
            Cari Anime Lain
          </Link>
        </div>
      </div>
    </section>
  );
}
