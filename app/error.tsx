"use client";

import Link from "next/link";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div role="alert" className="glass w-full max-w-xl overflow-hidden border-red-500/25 bg-[#111416] text-center">
        <div className="border-b border-white/5 bg-red-500/5 px-8 py-10">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-red-500/25 bg-red-500/10 text-red-400">
            <AlertTriangle size={30} aria-hidden="true" />
          </span>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.35em] text-red-400">Terjadi Gangguan</p>
          <h1 className="mt-3 text-2xl font-black text-white sm:text-3xl">Halaman belum dapat dimuat</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-400">
            Server anime mungkin sedang sibuk atau koneksi ke penyedia data terputus. Tontonan dan akunmu tidak berubah.
          </p>
        </div>

        <div className="flex flex-col gap-3 p-6 sm:flex-row sm:justify-center">
          <button type="button" onClick={() => reset()} className="btn-primary">
            <RefreshCcw size={17} aria-hidden="true" />
            Coba Lagi
          </button>
          <Link href="/" prefetch={false} className="btn-secondary">
            <Home size={17} aria-hidden="true" />
            Kembali ke Beranda
          </Link>
        </div>

        {error.digest && (
          <p className="pb-6 text-[9px] font-bold uppercase tracking-widest text-gray-600">
            Kode gangguan: {error.digest}
          </p>
        )}
      </div>
    </section>
  );
}
