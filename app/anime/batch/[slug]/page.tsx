"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

/* ── Interfaces ──────────────────────────── */

type DownloadUrl = {
  title: string;
  url: string;
};

type QualityInfo = {
  title: string;
  size: string;
  urls: DownloadUrl[];
};

type FormatInfo = {
  title: string;
  qualities: QualityInfo[];
};

type BatchDetail = {
  title: string;
  poster: string;
  downloadUrl: {
    formats: FormatInfo[];
  };
};

/* ── Loading Skeleton ──────────────────── */

function Skeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
      <div className="h-6 w-32 bg-white/5 rounded mb-8" />
      <div className="glass rounded-3xl p-8 border border-white/5 space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-48 h-64 bg-white/5 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-4">
            <div className="h-8 w-3/4 bg-white/5 rounded-lg" />
            <div className="h-4 w-1/2 bg-white/5 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;

  const [data, setData] = useState<BatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBatchDetail() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`https://www.sankavollerei.com/anime/batch/${slug}`);
        if (!res.ok) throw new Error("Gagal mengambil rincian batch");
        const json = await res.json();
        setData(json.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchBatchDetail();
  }, [slug]);

  if (loading) return <Skeleton />;

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="glass rounded-3xl p-10 text-center max-w-md border-white/5 shadow-2xl">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Opsi Unduhan Tidak Ditemukan</h2>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">Rincian batch ini mungkin sudah tidak tersedia atau telah dipindahkan.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => window.location.reload()} className="btn-primary w-full py-3">Coba Lagi</button>
            <Link href="/batch" prefetch={false} className="px-6 py-3 rounded-xl glass border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-all uppercase tracking-widest">Kembali ke Daftar Batch</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* ── Breadcrumb ───────────────────────────── */}
      <div className="flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-widest text-gray-500">
        <Link href="/" prefetch={false} className="hover:text-white transition-colors">Home</Link>
        <span className="opacity-30">/</span>
        <Link href="/batch" prefetch={false} className="hover:text-white transition-colors">Batch</Link>
        <span className="opacity-30">/</span>
        <span className="text-gray-300 truncate max-w-[200px]">{data.title}</span>
      </div>

      <div className="animate-fade-in-up">
        {/* ── Header Card ─────────────────────────── */}
        <section className="glass rounded-3xl p-8 border border-white/5 mb-10 overflow-hidden relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#6c5ce7]/5 rounded-full blur-[100px] -z-10" />
           
           <div className="flex flex-col md:flex-row gap-10 items-start">
             <div className="w-48 sm:w-56 flex-shrink-0 shadow-2xl rounded-2xl overflow-hidden border border-white/10 group">
                <img src={data.poster} alt={data.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
             </div>
             
             <div className="flex-1 space-y-6">
                <div>
                  <div className="inline-block px-3 py-1 rounded-lg bg-[#6c5ce7]/10 border border-[#6c5ce7]/20 text-[#a29bfe] text-[10px] font-black uppercase tracking-widest mb-4">
                    Full Pack Download
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">{data.title}</h1>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 text-center">Tipe Berkas</p>
                    <p className="text-sm text-gray-200 font-black text-center italic tracking-wider">ZIP / RAR PACK</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 text-center">Status</p>
                    <p className="text-sm text-green-400 font-black text-center italic tracking-wider">AVAILABLE</p>
                  </div>
                </div>
             </div>
           </div>
        </section>

        {/* ── Download Links ──────────────────────── */}
        <div className="space-y-8">
           <div className="flex items-center gap-4 mb-2">
              <h2 className="section-title">Pilih Format & Kualitas</h2>
              <div className="h-[2px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {data.downloadUrl.formats.map((format, fIdx) => (
               <div key={fIdx} className="glass rounded-3xl overflow-hidden border border-white/5 flex flex-col">
                  <div className="px-6 py-4 bg-white/[0.04] border-b border-white/[0.06] flex items-center justify-between">
                     <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-[#6c5ce7] rounded-full" />
                        Format {format.title}
                     </h3>
                     <span className="text-[10px] text-gray-500 font-bold italic">HIGH REZ</span>
                  </div>
                  
                  <div className="p-6 space-y-6 flex-1">
                    {format.qualities.map((item, qIdx) => (
                      <div key={qIdx} className="space-y-3">
                         <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                               <span className="text-xl font-black text-[#a29bfe]">{item.title}</span>
                               <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] font-bold text-gray-500 border border-white/5">{item.size}</span>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {item.urls.map((server, sIdx) => (
                              <a 
                                key={sIdx} 
                                href={server.url} 
                                target="_blank" 
                                className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 hover:bg-[#6c5ce7] hover:text-white hover:border-[#6c5ce7] hover:shadow-[0_0_15px_rgba(108,92,231,0.3)] text-center transition-all uppercase tracking-tighter truncate"
                                title={server.title}
                              >
                                {server.title}
                              </a>
                            ))}
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
             ))}
           </div>
        </div>

        <div className="mt-20 p-8 rounded-3xl border border-white/[0.03] bg-gradient-to-br from-white/[0.02] to-transparent text-center">
           <p className="text-gray-500 text-xs font-medium leading-relaxed max-w-2xl mx-auto italic">
             Kami menyarankan untuk menggunakan koneksi internet yang stabil saat mengunduh berkas batch. 
             Jika tautan rusak, silakan lapor pada admin melalui media sosial resmi AniStream.
           </p>
        </div>
      </div>
    </div>
  );
}
