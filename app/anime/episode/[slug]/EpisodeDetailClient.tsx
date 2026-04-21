"use client";

import React, { useState } from "react";
import Link from "next/link";

type DownloadUrl = { title: string; url: string };
type DownloadQuality = { title: string; urls: DownloadUrl[] };
type DownloadFormat = { title: string; qualities: DownloadQuality[] };

type ServerItem = { title: string; serverId: string; href: string };
type ServerQuality = { title: string; serverList: ServerItem[] };

type EpisodeListItem = {
  title: string;
  poster: string;
  releaseDate: string;
  episodeId: string;
  href: string;
};

export type EpisodeData = {
  title: string;
  animeId: string;
  poster: string;
  releasedOn: string;
  defaultStreamingUrl: string;
  hasPrevEpisode: boolean;
  prevEpisode?: { title: string; episodeId: string; href: string };
  hasNextEpisode: boolean;
  nextEpisode?: { title: string; episodeId: string; href: string };
  synopsis: { paragraphs: string[] };
  genreList: { title: string; genreId: string; href: string }[];
  server: { qualities: ServerQuality[] };
  downloadUrl: { formats: DownloadFormat[] };
  recommendedEpisodeList?: EpisodeListItem[];
  movie?: {
    href: string;
    animeList: {
      title: string;
      poster: string;
      animeId: string;
      href: string;
      genreList: { title: string; genreId: string }[];
    }[];
  };
};

interface EpisodeDetailClientProps {
  initialData: EpisodeData;
  slug: string;
}

export default function EpisodeDetailClient({ initialData, slug }: EpisodeDetailClientProps) {
  const [data] = useState<EpisodeData>(initialData);
  const [selectedFormat, setSelectedFormat] = useState(initialData.downloadUrl.formats[0]?.title || "");
  const [selectedQuality, setSelectedQuality] = useState(initialData.downloadUrl.formats[0]?.qualities[0]?.title || "");
  const [streamingUrl, setStreamingUrl] = useState(initialData.defaultStreamingUrl);
  
  // Find initial active server
  const firstServer = initialData.server.qualities.find(q => q.serverList.length > 0)?.serverList[0];
  const [activeServer, setActiveServer] = useState(firstServer?.serverId || "");
  const [switching, setSwitching] = useState(false);

  const cleanEpisodeSlug = (href: string) => href.replace(/^\/samehadaku\/episode\//, "");
  const cleanAnimeSlug = (href: string) => href.replace(/^\/samehadaku\/anime\//, "");

  const fetchServerUrl = async (serverId: string) => {
    try {
      setSwitching(true);
      setActiveServer(serverId);
      const res = await fetch(`https://www.sankavollerei.com/anime/samehadaku/server/${serverId}`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Gagal mengambil server");
      const json = await res.json();
      if (json.data?.url) {
        setStreamingUrl(json.data.url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setSwitching(false), 500);
    }
  };

  const currentFormatData = data.downloadUrl.formats.find(f => f.title === selectedFormat);
  const currentQualityData = currentFormatData?.qualities.find(q => q.title === selectedQuality);

  return (
    <div className="min-h-screen animate-fade-in font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">

        {/* ── Title & Meta ──────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <Link
              href={`/anime/${data.animeId}`}
              prefetch={false}
              className="mt-1 flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 hover:bg-[#6c5ce7]/20 border border-white/10 flex items-center justify-center transition-all group active:scale-95"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-[#a29bfe]" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-md">{data.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-bold font-sans">
                <span className="px-2 py-1 bg-[#6c5ce7]/20 text-[#a29bfe] rounded uppercase tracking-widest text-[10px]">Episode</span>
                <span className="text-gray-500 flex items-center gap-1.5 uppercase tracking-[0.2em] text-[9px]">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {data.releasedOn}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {data.genreList.map((genre) => (
              <span key={genre.genreId} className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-white/5 border border-white/10 text-gray-500 hover:text-white hover:border-[#6c5ce7]/50 transition-colors">
                {genre.title}
              </span>
            ))}
          </div>
        </div>

        {/* ── Video Player ──────────────────────────── */}
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/60 bg-black aspect-video relative group/player">
            {switching && (
              <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-3 animate-fade-in">
                <div className="w-12 h-12 border-4 border-[#6c5ce7]/20 border-t-[#6c5ce7] rounded-full animate-spin shadow-lg shadow-[#6c5ce7]/20" />
                <span className="text-[10px] font-black uppercase text-white tracking-[0.3em] animate-pulse">Switching Server...</span>
              </div>
            )}
            <iframe
              src={streamingUrl}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              title={data.title}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass p-4 rounded-2xl border border-white/5 shadow-xl">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 max-w-full overflow-x-auto no-scrollbar">
              {data.server.qualities.map((qual) => (
                qual.serverList.length > 0 && (
                  <div key={qual.title} className="flex items-center gap-2 p-1.5 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                    <span className="text-[9px] font-black text-gray-500 uppercase px-2 whitespace-nowrap">{qual.title}</span>
                    <div className="flex gap-1">
                      {qual.serverList.map((server) => (
                        <button
                          key={server.serverId}
                          className={`px-3 py-1.5 text-[10px] rounded-lg font-black uppercase tracking-tighter transition-all active:scale-95 ${
                            activeServer === server.serverId
                              ? "bg-[#6c5ce7] text-white shadow-lg shadow-[#6c5ce7]/20"
                              : "text-gray-500 hover:text-white hover:bg-white/10"
                          }`}
                          onClick={() => fetchServerUrl(server.serverId)}
                        >
                          {server.title.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              {data.hasPrevEpisode && data.prevEpisode && (
                <Link href={`/anime/episode/${cleanEpisodeSlug(data.prevEpisode.href)}`} prefetch={false} className="text-center py-3 px-6 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 transition-all flex-1 md:flex-none active:scale-95 border border-white/5">
                  Prev
                </Link>
              )}
              {data.hasNextEpisode && data.nextEpisode && (
                <Link href={`/anime/episode/${cleanEpisodeSlug(data.nextEpisode.href)}`} prefetch={false} className="text-center py-3 px-6 bg-[#6c5ce7] hover:bg-[#5a4ecf] rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all flex-1 md:flex-none shadow-lg shadow-[#6c5ce7]/20 active:scale-95">
                  Next
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
            {/* ── Download Section ──────────────────────── */}
            <section className="glass rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
              <div className="p-8 border-b border-white/5 flex items-center justify-between flex-wrap gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] flex items-center justify-center shadow-xl shadow-[#6c5ce7]/20">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Unduh Episode</h2>
                    <p className="text-[10px] text-gray-500 font-bold tracking-[0.3em] uppercase mt-1">Pilih format & kualitas</p>
                  </div>
                </div>

                <div className="flex p-1.5 bg-white/[0.03] rounded-2xl border border-white/[0.05] ring-1 ring-white/5">
                  {data.downloadUrl.formats.map((f) => (
                    <button
                      key={f.title}
                      onClick={() => {
                        setSelectedFormat(f.title);
                        if (f.qualities.length > 0) setSelectedQuality(f.qualities[0].title);
                      }}
                      className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        selectedFormat === f.title ? "bg-white/10 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {f.title.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="flex flex-wrap gap-2">
                  {currentFormatData?.qualities.map((q) => (
                    <button
                      key={q.title}
                      onClick={() => setSelectedQuality(q.title)}
                      className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all border ${
                        selectedQuality === q.title
                          ? "bg-[#6c5ce7] border-[#6c5ce7] text-white shadow-2xl shadow-[#6c5ce7]/20 scale-105"
                          : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10"
                      }`}
                    >
                      {q.title}
                    </button>
                  ))}
                </div>

                {currentQualityData && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {currentQualityData.urls.map((dl) => (
                      <a
                        key={dl.title}
                        href={dl.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center p-4 rounded-[20px] bg-white/[0.02] border border-white/[0.04] text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-[#6c5ce7] hover:text-white hover:border-[#6c5ce7] hover:shadow-lg transition-all text-center leading-tight active:scale-95"
                      >
                        {dl.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* ── Ringkasan ────────────────────── */}
            <section className="space-y-6">
              <h3 className="section-title tracking-[0.3em]">Ringkasan Episode</h3>
              <div className="glass p-8 rounded-[2rem] border border-white/5 space-y-6 shadow-xl">
                {data.synopsis ? (
                  data.synopsis.paragraphs?.map((p, i) => (
                    <p key={i} className="text-sm leading-loose text-gray-400 font-medium animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>{p}</p>
                  ))
                ) : (
                  <p className="italic text-gray-500 text-center py-4">Ringkasan tidak tersedia untuk episode ini.</p>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-10">
            {/* ── Recommended Episodes ──────────────────── */}
            {data.recommendedEpisodeList && data.recommendedEpisodeList.length > 0 && (
              <section className="space-y-6">
                <h3 className="section-title tracking-[0.3em]">Episode Lainnya</h3>
                <div className="space-y-4">
                  {data.recommendedEpisodeList.slice(0, 8).map((ep, i) => (
                    <Link key={i} href={`/anime/episode/${cleanEpisodeSlug(ep.href)}`} prefetch={false} className="group flex gap-4 glass p-3 rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-all hover:border-[#6c5ce7]/30">
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative shadow-lg">
                        <img src={ep.poster} alt={ep.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      </div>
                      <div className="flex-1 py-1 flex flex-col justify-center min-w-0">
                        <h4 className="text-[12px] font-black text-gray-300 group-hover:text-[#a29bfe] line-clamp-2 leading-tight transition-colors">{ep.title}</h4>
                        <p className="text-[9px] text-gray-500 font-black uppercase mt-2 tracking-widest opacity-60">{ep.releaseDate}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ── Recommended Movies ────────────────────── */}
            {data.movie?.animeList && data.movie.animeList.length > 0 && (
              <section className="space-y-6">
                <h3 className="section-title tracking-[0.3em]">Rekomendasi Film</h3>
                <div className="space-y-4">
                  {data.movie.animeList.slice(0, 5).map((anime, i) => (
                    <Link key={i} href={`/anime/${cleanAnimeSlug(anime.href)}`} prefetch={false} className="group flex gap-4 h-24 glass p-3 rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-all hover:border-[#6c5ce7]/30">
                      <div className="w-16 h-full rounded-xl overflow-hidden flex-shrink-0 shadow-lg border border-white/10">
                        <img src={anime.poster} alt={anime.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>
                      <div className="flex-1 py-1 flex flex-col justify-center">
                        <h4 className="text-[11px] font-black text-gray-300 group-hover:text-[#6c5ce7] line-clamp-2 leading-tight transition-colors">{anime.title}</h4>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {anime.genreList.slice(0, 2).map((g, gi) => (
                            <span key={gi} className="px-2 py-0.5 rounded-md bg-[#6c5ce7]/10 text-[8px] text-[#a29bfe] font-black uppercase tracking-widest">{g.title}</span>
                          ))}
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
