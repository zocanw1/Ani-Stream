"use client";

import React, { useState } from "react";
import Link from "next/link";
import WatchRecorder from "@/components/WatchRecorder";
import Image from "next/image";
import MobileFullscreenPlayer from "@/components/MobileFullscreenPlayer";
import { ChevronLeft, Download, Sparkles } from "lucide-react";

type DownloadUrl = { title: string; url: string };
type DownloadQuality = { title: string; urls: DownloadUrl[] };
type DownloadFormat = { title: string; qualities: DownloadQuality[] };
type ServerItem = { title: string; serverId: string; href: string };
type ServerQuality = { title: string; serverList: ServerItem[] };
type EpisodeListItem = { title: string; poster: string; releaseDate: string; episodeId: string; href: string };

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
    animeList: { title: string; poster: string; animeId: string; href: string; genreList: { title: string; genreId: string }[] }[];
  };
};

export default function EpisodeDetailClient({ initialData, slug }: { initialData: EpisodeData; slug: string }) {
  const [data] = useState<EpisodeData>(initialData);
  const [selectedFormat, setSelectedFormat] = useState(initialData.downloadUrl.formats[0]?.title || "");
  const [selectedQuality, setSelectedQuality] = useState(initialData.downloadUrl.formats[0]?.qualities[0]?.title || "");
  const [streamingUrl, setStreamingUrl] = useState(initialData.defaultStreamingUrl);
  const [activeServer, setActiveServer] = useState("");
  const [switching, setSwitching] = useState(false);
  const [serverSwitchError, setServerSwitchError] = useState("");

  const cleanEpisodeSlug = (href: string) => href.replace(/^\/samehadaku\/episode\//, "");
  const cleanAnimeSlug = (href: string) => href.replace(/^\/samehadaku\/anime\//, "");

  const fetchServerUrl = async (serverId: string) => {
    try {
      setSwitching(true);
      setServerSwitchError("");
      const res = await fetch(`/api/anime/server?source=samehadaku&serverId=${encodeURIComponent(serverId)}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Gagal mengambil server");
      const json = await res.json();
      const nextUrl = json.data?.url;
      if (typeof nextUrl !== "string" || new URL(nextUrl).protocol !== "https:") {
        throw new Error("Server tidak memberikan URL streaming yang aman");
      }
      setStreamingUrl(nextUrl);
      setActiveServer(serverId);
    } catch (err) {
      console.error(err);
      setServerSwitchError("Server ini sedang tidak tersedia. Player tetap memakai server sebelumnya.");
    } finally {
      setSwitching(false);
    }
  };

  const currentFormatData = data.downloadUrl.formats.find(f => f.title === selectedFormat);
  const currentQualityData = currentFormatData?.qualities.find(q => q.title === selectedQuality);
  const animeTitle = data.title.split(" Episode")[0] || data.title;

  return (
    <div className="min-h-screen animate-fade-in font-sans">
      <WatchRecorder
        source="samehadaku"
        animeSlug={data.animeId}
        animeTitle={animeTitle}
        episodeSlug={slug}
        episodeTitle={data.title}
        posterUrl={data.poster}
        animePath={`/anime/${data.animeId}`}
        episodePath={`/anime/episode/${slug}`}
        playerSrc={streamingUrl}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">

        {/* ── Title & Meta ── */}
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <Link
              href={`/anime/${data.animeId}`}
              prefetch={false}
              className="mt-1 flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 hover:bg-[var(--secondary)]/20 border border-white/10 flex items-center justify-center transition-all group active:scale-95 hover-glow-secondary"
            >
              <ChevronLeft size={20} className="text-[var(--text-secondary)] group-hover:text-[var(--secondary-light)]" />
            </Link>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 border border-[var(--border-glow)] text-[10px] font-black uppercase tracking-[0.15em] mb-3" style={{color: "var(--primary)"}}>
                <Sparkles size={12} /> Streaming
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                {data.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-bold">
                <span className="px-3 py-1 rounded-lg uppercase tracking-widest text-[10px]" style={{
                  background: "rgba(124,58,237,0.2)", color: "var(--secondary-light)"
                }}>
                  Episode
                </span>
                <span className="text-[var(--text-dim)] flex items-center gap-1.5 uppercase tracking-[0.2em] text-[9px]">
                  {data.releasedOn}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {data.genreList.map((genre) => (
              <span
                key={genre.genreId}
                className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-white/5 border border-white/10 text-[var(--text-secondary)] hover:text-white transition-colors hover-glow"
              >
                {genre.title}
              </span>
            ))}
          </div>
        </div>

        {/* ── Video Player Premium ── */}
        <div className="space-y-4">
          <MobileFullscreenPlayer
            src={streamingUrl}
            title={data.title}
            className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/60 bg-black aspect-video relative group/player"
          >
            {switching && (
              <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-3 animate-fade-in">
                <div className="w-14 h-14 border-4 rounded-full animate-spin shadow-lg" style={{
                  borderColor: "rgba(124,58,237,0.2)", borderTopColor: "var(--secondary)",
                  boxShadow: "0 0 20px var(--secondary-glow)",
                }} />
                <span className="text-[10px] font-black uppercase text-white tracking-[0.3em] animate-pulse">
                  Switching Server...
                </span>
              </div>
            )}
          </MobileFullscreenPlayer>

          {/* Server & Navigation Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass p-5 rounded-2xl border border-white/5 shadow-xl">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 max-w-full overflow-x-auto">
              {data.server.qualities.map((qual) => (
                qual.serverList.length > 0 && (
                  <div key={qual.title} className="flex items-center gap-2 p-1.5 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                    <span className="text-[9px] font-black text-[var(--text-dim)] uppercase px-2 whitespace-nowrap">
                      {qual.title}
                    </span>
                    <div className="flex gap-1">
                      {qual.serverList.map((server) => (
                        <button
                          key={server.serverId}
                          type="button"
                          disabled={switching}
                          className={`px-4 py-2 text-[10px] rounded-lg font-black uppercase tracking-tighter transition-all active:scale-95 ${
                            activeServer === server.serverId
                              ? "text-white shadow-lg"
                              : "text-[var(--text-secondary)] hover:text-white hover:bg-white/10 disabled:cursor-wait disabled:opacity-50"
                          }`}
                          style={activeServer === server.serverId ? {
                            background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                            boxShadow: "0 0 16px var(--primary-glow)",
                          } : {}}
                          onClick={() => fetchServerUrl(server.serverId)}
                        >
                          {server.title.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              {data.hasPrevEpisode && data.prevEpisode && (
                <Link
                  href={`/anime/episode/${cleanEpisodeSlug(data.prevEpisode.href)}`}
                  prefetch={false}
                  className="text-center py-3 px-6 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] transition-all flex-1 md:flex-none active:scale-95 border border-white/5"
                >
                  ⬅ Prev
                </Link>
              )}
              {data.hasNextEpisode && data.nextEpisode && (
                <Link
                  href={`/anime/episode/${cleanEpisodeSlug(data.nextEpisode.href)}`}
                  prefetch={false}
                  className="btn-glow text-center py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all flex-1 md:flex-none active:scale-95"
                >
                  Next ➡
                </Link>
              )}
            </div>
          </div>
          {serverSwitchError && (
            <p role="alert" className="px-2 text-center text-xs font-bold text-red-400">
              {serverSwitchError}
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
            {/* ── Download Section Premium ── */}
            <section className="glass rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
              <div className="p-8 border-b border-white/5 flex items-center justify-between flex-wrap gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl" style={{
                    background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                    boxShadow: "0 0 20px var(--primary-glow)",
                  }}>
                    <Download size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Unduh Episode</h2>
                    <p className="text-[10px] text-[var(--text-dim)] font-bold tracking-[0.3em] uppercase mt-1">Pilih format & kualitas</p>
                  </div>
                </div>

                <div className="flex p-1.5 bg-white/[0.03] rounded-2xl border border-white/[0.05]">
                  {data.downloadUrl.formats.map((f) => (
                    <button
                      key={f.title}
                      onClick={() => {
                        setSelectedFormat(f.title);
                        if (f.qualities.length > 0) setSelectedQuality(f.qualities[0].title);
                      }}
                      className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        selectedFormat === f.title ? "bg-white/10 text-white shadow-lg" : "text-[var(--text-dim)] hover:text-[var(--text-secondary)]"
                      }`}
                    >
                      {f.title.split(" ")[0]}
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
                          ? "text-white scale-105"
                          : "bg-white/5 border-white/5 text-[var(--text-secondary)] hover:bg-white/10 hover:border-white/10"
                      }`}
                      style={selectedQuality === q.title ? {
                        background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                        borderColor: "transparent",
                        boxShadow: "0 0 24px var(--primary-glow)",
                      } : {}}
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
                        className="flex items-center justify-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-white transition-all text-center leading-tight active:scale-95 hover-glow"
                      >
                        {dl.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* ── Synopsis ── */}
            <section className="space-y-6">
              <h3 className="section-title">Ringkasan Episode</h3>
              <div className="glass p-8 rounded-2xl border border-white/5 space-y-6 shadow-xl">
                {data.synopsis ? (
                  data.synopsis.paragraphs?.map((p, i) => (
                    <p key={i} className="text-sm leading-loose text-[var(--text-secondary)] font-medium animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                      {p}
                    </p>
                  ))
                ) : (
                  <p className="italic text-[var(--text-dim)] text-center py-4">Ringkasan tidak tersedia untuk episode ini.</p>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-10">
            {/* ── Other Episodes ── */}
            {data.recommendedEpisodeList && data.recommendedEpisodeList.length > 0 && (
              <section className="space-y-6">
                <h3 className="section-title">Episode Lainnya</h3>
                <div className="space-y-4">
                  {data.recommendedEpisodeList.slice(0, 8).map((ep, i) => (
                    <Link key={i} href={`/anime/episode/${cleanEpisodeSlug(ep.href)}`} prefetch={false}
                      className="group flex gap-4 glass p-3 rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-all hover-glow">
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative shadow-lg">
                        <Image src={ep.poster} alt={ep.title} fill sizes="5rem" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      </div>
                      <div className="flex-1 py-1 flex flex-col justify-center min-w-0">
                        <h4 className="text-[12px] font-black text-[var(--text-secondary)] group-hover:text-white line-clamp-2 leading-tight transition-colors">
                          {ep.title}
                        </h4>
                        <p className="text-[9px] text-[var(--text-dim)] font-black uppercase mt-2 tracking-widest opacity-60">
                          {ep.releaseDate}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ── Recommended Movies ── */}
            {data.movie?.animeList && data.movie.animeList.length > 0 && (
              <section className="space-y-6">
                <h3 className="section-title">Rekomendasi Film</h3>
                <div className="space-y-4">
                  {data.movie.animeList.slice(0, 5).map((anime, i) => (
                    <Link key={i} href={`/anime/${cleanAnimeSlug(anime.href)}`} prefetch={false}
                      className="group flex gap-4 h-24 glass p-3 rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-all hover-glow">
                      <div className="relative w-16 h-full rounded-xl overflow-hidden flex-shrink-0 shadow-lg border border-white/10">
                        <Image src={anime.poster} alt={anime.title} fill sizes="4rem" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>
                      <div className="flex-1 py-1 flex flex-col justify-center">
                        <h4 className="text-[11px] font-black text-[var(--text-secondary)] group-hover:text-white line-clamp-2 leading-tight transition-colors">
                          {anime.title}
                        </h4>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {anime.genreList.slice(0, 2).map((g, gi) => (
                            <span key={gi} className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest" style={{
                              background: "rgba(124,58,237,0.1)", color: "var(--secondary-light)"
                            }}>
                              {g.title}
                            </span>
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
