"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

/* ── Interfaces ──────────────────────────── */

type Genre = {
  title: string;
  genreId: string;
  href: string;
};

type Episode = {
  title: string;
  eps: string | number;
  date: string;
  episodeId: string;
  href: string;
};

type RecommendedAnime = {
  title: string;
  poster: string;
  animeId: string;
  href: string;
};

type BatchDownloadUrl = {
  title: string;
  url: string;
};

type BatchQuality = {
  title: string;
  size: string;
  urls: BatchDownloadUrl[];
};

type BatchFormat = {
  title: string;
  qualities: BatchQuality[];
};

export type BatchData = {
  title: string;
  downloadUrl: {
    formats: BatchFormat[];
  };
};

export type OtakudesuDetail = {
  title: string;
  poster: string;
  japanese: string;
  score: string;
  producers: string;
  type: string;
  status: string;
  episodes: number | string | null;
  duration: string;
  aired: string;
  studios: string;
  batch: {
    batchId: string;
    href: string;
    otakudesuUrl: string;
  } | null;
  synopsis: {
    paragraphs: string[];
    connections: any[];
  };
  genreList: Genre[];
  episodeList: Episode[];
  recommendedAnimeList?: RecommendedAnime[];
};

interface OtakudesuDetailClientProps {
  data: OtakudesuDetail;
  slug: string;
}

export default function OtakudesuDetailClient({ data, slug }: OtakudesuDetailClientProps) {
  const [batchData, setBatchData] = useState<BatchData | null>(null);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [showBatch, setShowBatch] = useState(false);
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);

  const cleanEpisodeSlug = (href: string) => href.replace(/^\/anime\/episode\//, "");
  const cleanAnimeSlug = (href: string) => href.replace(/^\/anime\/anime\//, "");

  const fetchBatchInfo = async (batchId: string) => {
    if (batchData) {
      setShowBatch(!showBatch);
      if (!showBatch) {
        setTimeout(() => {
          document.getElementById('batch-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      return;
    }
    
    try {
      setLoadingBatch(true);
      setShowBatch(true);
      const res = await fetch(`https://www.sankavollerei.com/anime/batch/${batchId}`);
      if (!res.ok) throw new Error("Gagal mengambil data batch");
      const json = await res.json();
      setBatchData(json.data);
      setTimeout(() => {
        document.getElementById('batch-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoadingBatch(false);
    }
  };

  const statusClass = data.status?.toLowerCase().includes("ongoing") ? "badge-ongoing !bg-[#ff7675]/10 !text-[#ff7675] !border-[#ff7675]/20" : "badge-completed !bg-green-500/10 !text-green-500 !border-green-500/20";
  const visibleEpisodes = showAllEpisodes ? data.episodeList : data.episodeList?.slice(0, 12);

  return (
    <div className="min-h-screen pb-20 animate-fade-in font-sans">
      {/* ── Banner ────────────────────────────────── */}
      <div className="relative h-[350px] overflow-hidden">
        {data.poster && <Image src={data.poster} alt="" fill className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-30" priority />}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0d17]/20 via-[#0b0d17]/80 to-[#0b0d17]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-64 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster Card */}
          <div className="w-48 sm:w-56 mx-auto md:mx-0 flex-shrink-0">
            <div className="relative group">
               <Image src={data.poster} alt={data.title} width={300} height={400} className="w-full rounded-2xl shadow-2xl border border-white/10 aspect-[3/4] object-cover" />
               <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] pointer-events-none" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6 pt-4 md:pt-12 text-center md:text-left transition-all">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight drop-shadow-lg">{data.title}</h1>
              <p className="text-[#ff7675] text-sm italic mt-2 font-medium">{data.japanese}</p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <span className={`badge ${statusClass} font-black uppercase tracking-widest text-[10px]`}>{data.status}</span>
              <span className="badge bg-white/5 border-white/10 uppercase font-black tracking-widest text-[10px]">{data.type}</span>
              <span className="badge bg-yellow-500/10 text-yellow-400 border-yellow-500/20 font-black tracking-widest text-[10px]">⭐ {data.score}</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
              <div className="space-y-1">
                 <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Studio</p>
                 <p className="text-gray-200 font-bold">{data.studios || "-"}</p>
              </div>
              <div className="space-y-1">
                 <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Episodes</p>
                 <p className="text-gray-200 font-bold">{data.episodes || "-"}</p>
              </div>
              <div className="space-y-1">
                 <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Aired</p>
                 <p className="text-gray-200 font-bold">{data.aired || "-"}</p>
              </div>
              <div className="space-y-1">
                 <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Duration</p>
                 <p className="text-gray-200 font-bold">{data.duration || "-"}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
               {data.episodeList && data.episodeList.length > 0 && (
                 <Link 
                    href={`/otakudesu/episode/${cleanEpisodeSlug(data.episodeList[data.episodeList.length-1].href)}`} 
                    prefetch={true} 
                    className="btn-primary inline-flex items-center gap-3 bg-[#ff7675] hover:bg-[#ff4757] shadow-lg shadow-[#ff7675]/20 px-8 py-3.5 transition-all active:scale-95"
                 >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    <span className="font-black uppercase tracking-widest text-xs">Tonton Episode 1</span>
                 </Link>
               )}
               {data.batch && (
                  <button 
                    onClick={() => fetchBatchInfo(data.batch!.batchId)}
                    className={`px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all border flex items-center gap-3 active:scale-95 ${
                      showBatch ? 'bg-white text-black border-white shadow-xl' : 'bg-transparent text-[#ff7675] border-[#ff7675]/30 hover:bg-[#ff7675]/10'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    Download Batch
                  </button>
               )}
            </div>
          </div>
        </div>

        {/* ── Batch Section (Conditional) ───────────── */}
        {showBatch && (
          <section id="batch-section" className="mt-16 animate-fade-in-up scroll-mt-24 space-y-6">
            <div className="flex items-center justify-between">
               <h2 className="section-title before:bg-[#ff7675]">Batch Download Links</h2>
               <button onClick={() => setShowBatch(false)} className="text-[10px] font-black uppercase text-gray-500 hover:text-white tracking-widest">Tutup</button>
            </div>
            
            <div className="glass rounded-[2rem] overflow-hidden border-[#ff7675]/20 shadow-2xl">
              {loadingBatch ? (
                <div className="p-16 flex flex-col items-center justify-center gap-6">
                  <div className="w-12 h-12 border-4 border-[#ff7675] border-t-transparent rounded-full animate-spin shadow-lg shadow-[#ff7675]/20" />
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">Menyiapkan link batch...</p>
                </div>
              ) : batchData ? (
                <div className="divide-y divide-white/[0.05]">
                  {batchData.downloadUrl.formats.map((format, fIdx) => (
                    <div key={fIdx} className="p-8 space-y-8">
                       <h3 className="text-sm font-black text-white flex items-center gap-3 uppercase tracking-widest">
                         <span className="w-1.5 h-4 bg-[#ff7675] rounded-full" />
                         {format.title}
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {format.qualities.map((q, qIdx) => (
                           <div key={qIdx} className="bg-white/[0.03] rounded-3xl p-6 border border-white/[0.05] hover:border-[#ff7675]/30 transition-all group">
                              <div className="flex items-center justify-between mb-6">
                                 <div className="flex flex-col">
                                    <span className="text-lg font-black text-[#ff7675]">{q.title}</span>
                                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-0.5">{q.size}</span>
                                 </div>
                                 <div className="w-8 h-8 rounded-xl bg-[#ff7675]/10 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-[#ff7675]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                 </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                 {q.urls.map((server, sIdx) => (
                                   <a 
                                    key={sIdx} 
                                    href={server.url} 
                                    target="_blank" 
                                    className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-center text-gray-400 hover:bg-[#ff7675] hover:text-white hover:border-[#ff7675] transition-all uppercase tracking-tighter"
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
              ) : (
                <div className="p-10 text-center text-red-400 text-sm font-bold">Gagal memuat data batch. Coba lagi nanti.</div>
              )}
            </div>
          </section>
        )}

        {/* ── Synopsis & Details ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-16">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="section-title before:bg-[#ff7675] mb-6">Sinopsis</h2>
              <div className="glass rounded-2xl p-8 text-gray-300 text-[15px] leading-8 space-y-6 shadow-xl border-white/[0.03]">
                {data.synopsis?.paragraphs && data.synopsis.paragraphs.length > 0 ? (
                  data.synopsis.paragraphs.map((p, i) => <p key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>{p}</p>)
                ) : (
                  <p className="italic text-gray-500 text-center py-4 font-medium">Sinopsis untuk anime ini belum tersedia di database Otakudesu.</p>
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-title before:bg-[#ff7675]">Daftar Episode</h2>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest">{data.episodeList.length} Items</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleEpisodes.map((ep, idx) => (
                  <Link 
                    key={idx} 
                    href={`/otakudesu/episode/${cleanEpisodeSlug(ep.href)}`} 
                    prefetch={true} 
                    className="group relative glass p-5 rounded-2xl border border-white/[0.04] hover:border-[#ff7675]/50 hover:bg-white/[0.02] transition-all overflow-hidden flex flex-col justify-between min-h-[120px]"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff7675]/5 rounded-full blur-3xl group-hover:bg-[#ff7675]/20 transition-colors" />
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff7675] opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-start justify-between gap-3 relative z-10 w-full mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-gray-200 group-hover:text-white line-clamp-2 transition-colors">{ep.title}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-2 flex items-center gap-2">
                           {ep.date}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#ff7675] group-hover:bg-[#ff7675] group-hover:text-white transition-all flex-shrink-0">
                        <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    </div>

                    <div className="relative z-10 mt-auto">
                       <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#ff7675] bg-[#ff7675]/10 rounded-lg group-hover:bg-[#ff7675]/20 transition-colors border border-[#ff7675]/20 inline-block">
                         EPISODE {ep.eps}
                       </span>
                    </div>
                  </Link>
                ))}
              </div>

              {data.episodeList.length > 12 && (
                <button 
                  onClick={() => setShowAllEpisodes(!showAllEpisodes)}
                  className="w-full py-4 mt-6 glass rounded-2xl border border-white/5 text-[10px] font-black text-[#ff7675] hover:bg-white/[0.04] transition-all uppercase tracking-[0.3em] shadow-lg"
                >
                  {showAllEpisodes ? "Sembunyikan" : `Lihat Semua Episode (${data.episodeList.length})`}
                </button>
              )}
            </section>
          </div>

          <aside className="space-y-10">
             <section>
               <h2 className="section-title before:bg-[#ff7675] mb-6">Genre</h2>
               <div className="flex flex-wrap gap-2">
                 {data.genreList.map((g, i) => (
                   <span key={i} className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 hover:text-white hover:border-[#ff7675]/50 transition-all cursor-default uppercase tracking-widest">
                     {g.title}
                   </span>
                 ))}
               </div>
             </section>

             <section>
               <h2 className="section-title before:bg-[#ff7675] mb-6">Info Lainnya</h2>
               <div className="glass rounded-2xl p-6 space-y-4 border-white/[0.03]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Produser</span>
                    <span className="text-gray-200 font-bold text-right ml-4 line-clamp-1">{data.producers || "-"}</span>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Tipe</span>
                    <span className="text-gray-200 font-bold">{data.type}</span>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Status</span>
                    <span className={`font-black ${data.status.toLowerCase().includes('ongoing') ? 'text-[#ff7675]' : 'text-green-500'}`}>{data.status}</span>
                  </div>
               </div>
             </section>

              {data.recommendedAnimeList && data.recommendedAnimeList.length > 0 && (
                <section>
                  <h2 className="section-title before:bg-[#ff7675] mb-6">Rekomendasi</h2>
                  <div className="space-y-5">
                    {data.recommendedAnimeList.slice(0, 5).map((anime, i) => (
                      <Link 
                        key={i} 
                        href={`/otakudesu/anime/${cleanAnimeSlug(anime.href)}`} 
                        prefetch={false} 
                        className="group flex gap-4 h-24 hover:bg-white/[0.02] p-2 rounded-2xl transition-all border border-transparent hover:border-white/5"
                      >
                        <div className="w-16 h-full rounded-xl overflow-hidden flex-shrink-0 shadow-lg border border-white/10 relative">
                          <Image src={anime.poster} alt={anime.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex-1 py-1 flex flex-col justify-center">
                          <h4 className="text-[13px] font-black text-gray-300 group-hover:text-[#ff7675] line-clamp-2 leading-snug transition-colors">{anime.title}</h4>
                          <div className="mt-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ff7675] animate-pulse" />
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Recommended</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
          </aside>
        </div>
      </div>
    </div>
  );
}
