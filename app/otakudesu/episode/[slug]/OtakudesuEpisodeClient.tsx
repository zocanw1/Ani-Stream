"use client";

import React, { useState } from "react";
import Link from "next/link";

/* ── Interfaces ──────────────────────────── */

type DownloadUrl = { title: string; url: string };
type DownloadQuality = { title: string; size?: string; urls: DownloadUrl[] };

type ServerItem = { title: string; serverId: string; href: string };
type ServerQuality = { title: string; serverList: ServerItem[] };

type EpisodeListItem = {
  title: string;
  eps: number | string;
  date: string;
  episodeId: string;
  href: string;
};

export type EpisodeData = {
  title: string;
  animeId: string;
  releaseTime?: string;
  defaultStreamingUrl: string;
  hasPrevEpisode: boolean;
  prevEpisode?: { title: string; episodeId: string; href: string };
  hasNextEpisode: boolean;
  nextEpisode?: { title: string; episodeId: string; href: string };
  server: { qualities: ServerQuality[] };
  downloadUrl: { qualities: DownloadQuality[] };
  info: {
    credit?: string;
    duration?: string;
    type?: string;
    genreList: { title: string; genreId: string; href: string }[];
    episodeList: EpisodeListItem[];
  };
};

interface OtakudesuEpisodeClientProps {
  initialData: EpisodeData;
  slug: string;
}

export default function OtakudesuEpisodeClient({ initialData, slug }: OtakudesuEpisodeClientProps) {
  const [data] = useState<EpisodeData>(initialData);
  const [streamingUrl, setStreamingUrl] = useState(initialData.defaultStreamingUrl);
  const [selectedQuality, setSelectedQuality] = useState(initialData.downloadUrl.qualities[initialData.downloadUrl.qualities.length - 1]?.title || "");
  
  // Find initial active server
  const firstServer = initialData.server.qualities.find(q => q.serverList.length > 0)?.serverList[0];
  const [activeServer, setActiveServer] = useState(firstServer?.serverId || "");
  const [switching, setSwitching] = useState(false);

  const cleanEpisodeSlug = (href: string) => href.replace(/^\/anime\/episode\//, "");
  const cleanAnimeSlug = (href: string) => href.replace(/^\/anime\/anime\//, "");

  const fetchServerUrl = async (serverId: string) => {
    try {
      setSwitching(true);
      setActiveServer(serverId);
      const res = await fetch(`https://www.sankavollerei.com/anime/server/${serverId}`);
      if (!res.ok) throw new Error("Gagal mengambil URL server");
      const json = await res.json();
      if (json.data?.url) {
        setStreamingUrl(json.data.url);
      }
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setTimeout(() => setSwitching(false), 500);
    }
  };

  const currentDownloadData = data.downloadUrl.qualities.find(q => q.title === selectedQuality);

  return (
    <div className="min-h-screen animate-fade-in pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">

        {/* ── Breadcrumbs & Title ──────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em]">
             <Link href="/otakudesu" className="text-gray-500 hover:text-[#ff7675] transition-colors">Otakudesu</Link>
             <span className="text-gray-700">/</span>
             <Link href={`/otakudesu/anime/${data.animeId}`} className="text-gray-500 hover:text-[#ff7675] transition-colors truncate max-w-[200px] sm:max-w-none">
               {data.title.split(' Episode')[0]}
             </Link>
          </div>
          
          <div className="flex items-start gap-4">
            <Link
              href={`/otakudesu/anime/${data.animeId}`}
              prefetch={true}
              className="mt-1 flex-shrink-0 w-11 h-11 rounded-xl bg-white/5 hover:bg-[#ff7675]/20 border border-white/10 flex items-center justify-center transition-all group lg:w-12 lg:h-12 active:scale-95"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-[#ff7675]" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-lg">{data.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="px-3 py-1 bg-[#ff7675] text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#ff7675]/20">Otakudesu</span>
                <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {data.releaseTime || "Updated Today"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Video Player & Servers ─────────────────── */}
        <div className="space-y-4">
          <div className="rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/80 bg-black aspect-video relative group/player ring-1 ring-white/10">
            {switching && (
              <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 animate-fade-in">
                <div className="w-12 h-12 border-4 border-[#ff7675]/20 border-t-[#ff7675] rounded-full animate-spin shadow-lg shadow-[#ff7675]/20" />
                <span className="text-[10px] font-black uppercase text-white tracking-[0.4em] animate-pulse">Switching Server...</span>
              </div>
            )}
            <iframe
              src={streamingUrl}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              title={data.title}
            />
          </div>

          <div className="flex flex-col gap-4">
             {/* Server Switcher Grid */}
             <div className="glass p-5 rounded-[2rem] border border-white/5 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-1.5 h-4 bg-[#ff7675] rounded-full" />
                   <h3 className="text-[10px] font-black text-white uppercase tracking-widest opacity-60">Pilih Server Streaming</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                   {data.server.qualities.map((qual) => (
                      qual.serverList.length > 0 && (
                        <div key={qual.title} className="bg-white/[0.02] p-4 rounded-2xl border border-white/[0.04] transition-all hover:border-white/10">
                           <span className="text-[9px] font-black text-gray-500 uppercase block mb-3 tracking-widest">{qual.title} RESOLUTION</span>
                           <div className="flex flex-wrap gap-2">
                              {qual.serverList.map((server) => (
                                 <button
                                    key={server.serverId}
                                    onClick={() => fetchServerUrl(server.serverId)}
                                    className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-tighter rounded-xl transition-all border active:scale-95 ${
                                       activeServer === server.serverId
                                       ? "bg-[#ff7675] border-[#ff7675] text-white shadow-xl shadow-[#ff7675]/30"
                                       : "bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                                    }`}
                                 >
                                    {server.title.trim()}
                                 </button>
                              ))}
                           </div>
                        </div>
                      )
                   ))}
                </div>
             </div>

             {/* Navigation Controls */}
             <div className="flex items-center gap-3 overflow-hidden">
                {data.hasPrevEpisode && data.prevEpisode && (
                  <Link 
                    href={`/otakudesu/episode/${cleanEpisodeSlug(data.prevEpisode.href)}`} 
                    prefetch={true} 
                    className="flex-1 py-4 glass border border-white/5 hover:border-[#ff7675]/30 rounded-[20px] text-[11px] font-black uppercase text-gray-400 hover:text-white transition-all text-center flex items-center justify-center gap-2 group active:scale-95"
                  >
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M15 19l-7-7 7-7" /></svg>
                    Previous
                  </Link>
                )}
                
                <Link 
                  href={`/otakudesu/anime/${data.animeId}`} 
                  className="px-8 py-4 glass border border-white/5 hover:bg-white/5 rounded-[20px] text-[11px] font-black uppercase text-gray-400 hover:text-white transition-all hidden sm:flex items-center gap-3 active:scale-95"
                >
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                   List
                </Link>

                {data.hasNextEpisode && data.nextEpisode && (
                  <Link 
                    href={`/otakudesu/episode/${cleanEpisodeSlug(data.nextEpisode.href)}`} 
                    prefetch={true} 
                    className="flex-1 py-4 bg-[#ff7675] hover:bg-[#ff4757] rounded-[20px] text-[11px] font-black uppercase text-white transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-[#ff7675]/20 group active:scale-95"
                  >
                    Next
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M9 5l7 7-7 7" /></svg>
                  </Link>
                )}
             </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
            
            {/* ── Download Section ──────────────────────── */}
            <section className="glass rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
               <div className="p-8 border-b border-white/5 bg-white/[0.01] flex items-center justify-between flex-wrap gap-6">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-[#ff7675] flex items-center justify-center shadow-xl shadow-[#ff7675]/30">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                     </div>
                     <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Unduh Episode</h2>
                        <p className="text-[10px] text-gray-500 font-bold tracking-[0.3em] uppercase mt-1">SIMPAN DI PERANGKAT ANDA</p>
                     </div>
                  </div>

                  {/* Quality Pills */}
                  <div className="flex flex-wrap gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5 ring-1 ring-white/5">
                     {data.downloadUrl.qualities.map((q) => (
                        <button
                           key={q.title}
                           onClick={() => setSelectedQuality(q.title)}
                           className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              selectedQuality === q.title
                              ? "bg-[#ff7675] text-white shadow-xl"
                              : "text-gray-500 hover:text-white"
                           }`}
                        >
                           {q.title}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="p-8">
                  {currentDownloadData ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                       {currentDownloadData.urls.map((dl) => (
                          <a
                             key={dl.title}
                             href={dl.url}
                             target="_blank"
                             rel="noreferrer"
                             className="flex items-center justify-between p-5 rounded-[20px] bg-white/[0.02] border border-white/[0.04] hover:bg-[#ff7675]/10 hover:border-[#ff7675]/30 hover:scale-[1.03] transition-all group active:scale-95"
                          >
                             <span className="text-[11px] font-black uppercase tracking-tighter text-gray-400 group-hover:text-white">{dl.title}</span>
                             <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#ff7675] group-hover:text-white transition-all">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                             </div>
                          </a>
                       ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-gray-600 font-black uppercase tracking-[0.3em] text-xs">Pilih kualitas untuk memunculkan link unduhan.</div>
                  )}
               </div>
            </section>

            {/* ── Additional Info ───────────────────────── */}
            <section className="space-y-6">
              <h2 className="section-title before:bg-[#ff7675]">Informasi Episode</h2>
              <div className="glass p-8 rounded-[2.5rem] border border-white/5 grid grid-cols-2 sm:grid-cols-3 gap-10 shadow-xl">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest opacity-60">Durasi Konten</p>
                  <p className="text-sm font-black text-gray-200">{data.info.duration || "-"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest opacity-60">Tipe Siaran</p>
                  <p className="text-sm font-black text-gray-200">{data.info.type || "TV Series"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest opacity-60">Kategori Genre</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {data.info.genreList.slice(0, 3).map(g => (
                      <span key={g.genreId} className="text-[11px] font-black text-[#ff7675] uppercase tracking-tighter">{g.title}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-12">
            {/* ── Episode List Sidebar ───────────────────── */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="section-title tracking-[0.2em] before:bg-[#ff7675]">Daftar Episode</h3>
                 <span className="px-3 py-1 bg-white/5 rounded-xl text-[10px] font-black text-gray-500 border border-white/5">{data.info.episodeList.length} ITEMS</span>
              </div>
              <div className="space-y-3 max-h-[700px] overflow-y-auto pr-3 no-scrollbar custom-scrollbar">
                {data.info.episodeList.map((ep, i) => {
                   const isActive = ep.episodeId === slug;
                   return (
                    <Link 
                      key={i} 
                      href={`/otakudesu/episode/${cleanEpisodeSlug(ep.href)}`} 
                      prefetch={true} 
                      className={`group block p-5 rounded-2xl border transition-all active:scale-[0.98] ${
                        isActive 
                        ? "bg-[#ff7675]/10 border-[#ff7675]/40 shadow-lg shadow-[#ff7675]/10" 
                        : "glass border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                         <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-[11px] flex-shrink-0 transition-all ${
                            isActive ? "bg-[#ff7675] text-white shadow-xl shadow-[#ff7675]/30" : "bg-white/5 text-gray-500 group-hover:text-white group-hover:bg-[#ff7675]/20 group-hover:scale-105"
                         }`}>
                           {ep.eps}
                         </div>
                         <div className="min-w-0">
                           <h4 className={`text-[12px] font-black truncate transition-colors ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-200"}`}>{ep.title}</h4>
                           <p className="text-[9px] text-gray-500 font-black uppercase mt-2 tracking-widest opacity-60">{ep.date || "Ready to Stream"}</p>
                         </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
