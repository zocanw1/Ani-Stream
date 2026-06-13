import Link from "next/link";
import { Home, SearchX } from "lucide-react";

export default function NotFoundPage() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="glass w-full max-w-xl overflow-hidden text-center">
        <div className="border-b border-white/5 px-8 py-12">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300">
            <SearchX size={30} aria-hidden="true" />
          </span>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-red-400">404</p>
          <h1 className="mt-3 text-2xl font-black text-white sm:text-3xl">Halaman Tidak Ditemukan</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-400">
            Anime, episode, atau halaman yang kamu cari sudah tidak tersedia atau alamatnya tidak sesuai.
          </p>
        </div>

        <div className="flex flex-col gap-3 p-6 sm:flex-row sm:justify-center">
          <Link href="/" prefetch={false} className="btn-primary">
            <Home size={17} aria-hidden="true" />
            Kembali ke Beranda
          </Link>
          <Link href="/search" prefetch={false} className="btn-secondary">
            Cari Anime Lain
          </Link>
        </div>
      </div>
    </section>
  );
}
