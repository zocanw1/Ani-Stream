"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Sparkles, ChevronRight, Clock, Star, Download, X } from "lucide-react";

/* ── Interfaces ──────────────────────────── */

type Genre = { title: string; genreId: string; href: string };
type Episode = { title: string; eps: string | number; date: string; episodeId: string; href: string };
type RecommendedAnime = { title: string; poster: string; animeId: string; href: string };
type BatchDownloadUrl = { title: string; url: string };
type BatchQuality = { title: string; size: string; urls: BatchDownloadUrl[] };
type BatchFormat = { title: string; qualities: BatchQuality[] };
type BatchData = { title: string; downloadUrl: { formats: BatchFormat[] } };

export type AnimeDetail = {
  title: string; poster: string; japanese: string;
  english?: string; synonyms?: string;
  score: { value: string; users: string };
  producers: string; type: string; status: string;
  episodes: number | string | null; duration: string;
  aired: string; studios: string; source?: string;
  season?: string; trailer?: string;
  batchList: { title: string; batchId: string; href: string }[];
  synopsis: string | { paragraphs: string[]; connections?: unknown };
  genreList: Genre[];
  episodeList: Episode[];
  recommendedAnimeList?: RecommendedAnime[];
};

interface AnimeDetailClientProps { data: AnimeDetail; slug: string }

export default function AnimeDetailClient({ data, slug }: AnimeDetailClientProps) {
  const [batchData, setBatchData] = useState<BatchData | null>(null);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [showBatch, setShowBatch] = useState(false);
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);

  const cleanEpisodeSlug = (href: string) => href.replace(/^\/samehadaku\/episode\//, "");
  const cleanAnimeSlug = (href: string) => href.replace(/^\/samehadaku\/anime\//, "");

  const fetchBatchInfo = async (batchId: string) => {
    if (batchData) { setShowBatch(!showBatch); return; }
    try {
      setLoadingBatch(true);
      setShowBatch(true);
      const res = await fetch(`/api/anime/batch?source=samehadaku&batchId=${encodeURIComponent(batchId)}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal mengambil data batch");
      const json = await res.json();
      setBatchData(json.data);
    } catch (err) { console.error(err); }
    finally { setLoadingBatch(false); }
  };

  const statusClass = data.status?.toLowerCase().includes("ongoing") ? "badge-ongoing" : "badge-completed";
  const visibleEpisodes = showAllEpisodes ? data.episodeList : data.episodeList?.slice(0, 12);

  return (
    <div className="min-h-screen pb-20 animate-fade-in font-sans">
      {/* ── Premium Banner ── */}
      <div className="relative h-[400px] overflow-hidden">
        {data.poster && (
          <Image src={data.poster} alt="" fill sizes="100vw" className="object-cover scale-110 blur-xl opacity-25" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-deep)]/10 via-[var(--bg-deep)]/80 to-[var(--bg-deep)]" />
        <div className="absolute inset-0 opacity-30 bg-grid-dense" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-72 relative z-10">
        {/* ── Hero Section ── */}
        <div className="flex flex-col md:flex-row gap-10">
          {/* Poster */}
          <div className="w-48 sm:w-56 mx-auto md:mx-0 flex-shrink-0">
            <div className="relative group aspect-[3/4] overflow-hidden rounded-2xl shadow-2xl border border-white/10 glow-card-premium">
              <Image src={data.poster} alt={data.title} fill sizes="(max-width: 640px) 12rem, 14rem" className="object-cover" priority />
              <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_60px_rgba(0,0,0,0.6)] pointer-events-none" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6 pt-4 md:pt-16 text-center md:text-left">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 border border-[var(--border-glow)] text-[10px] font-black uppercase tracking-[0.15em] mb-3" style={{color: "var(--primary)"}}>
                <Sparkles size={12} /> Detail Anime
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight drop-shadow-lg">
                {data.title || data.english || slug}
              </h1>
              <div className="flex flex-col gap-1 mt-3">
                <p className="text-[var(--text-secondary)] text-sm italic font-medium">{data.japanese}</p>
                {data.english && data.english !== data.title && (
                  <p className="text-[var(--text-dim)] text-xs font-bold">{data.english}</p>
                )}
                {data.synonyms && (
                  <p className="text-[var(--text-muted)] text-[10px] uppercase font-black tracking-[0.2em]">
                    AKA: {data.synonyms}
                  </p>
                )}
              </div>
            </div>

            {/* Badge Row */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <span className={`badge font-black uppercase tracking-widest text-[10px] ${statusClass}`}>
                {data.status}
              </span>
              <span className="badge font-black uppercase tracking-widest text-[10px] glass">
                {data.type}
              </span>
              <span className="badge font-black tracking-widest text-[10px]" style={{
                background: "rgba(251,191,36,0.1)", color: "var(--gold)", borderColor: "rgba(251,191,36,0.2)"
              }}>
                <Star size={11} fill="currentColor" /> {data.score.value}
              </span>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 text-sm glass p-5 rounded-2xl border border-[var(--border)] max-w-2xl mx-auto md:mx-0">
              {[
                { label: "Studio", value: data.studios },
                { label: "Episodes", value: data.episodes },
                { label: "Tayang", value: data.aired },
                { label: "Musim", value: data.season },
                { label: "Sumber", value: data.source },
                { label: "Durasi", value: data.duration },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <p className="text-[var(--text-dim)] font-bold uppercase text-[9px] tracking-[0.15em]">{item.label}</p>
                  <p className="text-[var(--text)] font-bold text-sm">{item.value || "-"}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
              {data.episodeList && data.episodeList.length > 0 && (
                <Link
                  href={`/anime/episode/${cleanEpisodeSlug(data.episodeList[0].href)}`}
                  prefetch={false}
                  className="btn-glow inline-flex items-center gap-3 px-8 py-3.5 text-xs font-black uppercase tracking-[0.15em]"
                >
                  <Play size={18} fill="currentColor" /> Tonton Episode 1
                </Link>
              )}
              {data.batchList && data.batchList.length > 0 && (
                <div className="relative group/batch">
                  <button
                    className={`px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-[0.15em] transition-all border flex items-center gap-3 active:scale-95 ${
                      showBatch
                        ? "bg-white text-black border-white shadow-xl"
                        : "bg-transparent border-[var(--border-strong)] hover:bg-white/5"
                    }`}
                    style={!showBatch ? {color: "var(--text-secondary)"} : {}}
                    onClick={() => data.batchList.length === 1 ? fetchBatchInfo(data.batchList[0].batchId) : null}
                  >
                    <Download size={16} />
                    Download Batch {data.batchList.length > 1 && `(${data.batchList.length})`}
                  </button>

                  {data.batchList.length > 1 && (
                    <div className="absolute top-full left-0 mt-3 w-72 glass-strong rounded-2xl border border-white/10 shadow-2xl opacity-0 translate-y-3 pointer-events-none group-hover/batch:opacity-100 group-hover/batch:translate-y-0 group-hover/batch:pointer-events-auto transition-all z-50 overflow-hidden">
                      {data.batchList.map((b) => (
                        <button
                          key={b.batchId}
                          onClick={() => fetchBatchInfo(b.batchId)}
                          className="w-full px-5 py-4 text-left text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0"
                        >
                          {b.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-16">
          <div className="lg:col-span-2 space-y-12">

            {/* Batch Section */}
            {showBatch && (
              <section id="batch-section" className="animate-fade-in-up scroll-mt-24 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="section-title text-lg">Batch Download Links</h2>
                  <button onClick={() => setShowBatch(false)} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text-dim)] hover:text-white transition-colors">
                    <X size={14} /> Tutup
                  </button>
                </div>
                <div className="glass rounded-2xl overflow-hidden border border-[var(--border-secondary)]">
                  {loadingBatch ? (
                    <div className="p-16 flex flex-col items-center justify-center gap-6">
                      <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{
                        borderColor: "rgba(124,58,237,0.3)", borderTopColor: "transparent",
                        boxShadow: "0 0 16px var(--secondary-glow)"
                      }} />
                      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-dim)] animate-pulse">
                        Menyiapkan link batch...
                      </p>
                    </div>
                  ) : batchData ? (
                    <div className="divide-y divide-white/5">
                      {batchData.downloadUrl.formats.map((format, fIdx) => (
                        <div key={fIdx} className="p-8 space-y-8">
                          <h3 className="text-sm font-black text-white flex items-center gap-3 uppercase tracking-widest">
                            <span className="w-1.5 h-5 rounded-full" style={{background: "linear-gradient(180deg, var(--primary), var(--secondary))"}} />
                            {format.title}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                            {format.qualities.map((q, qIdx) => (
                              <div key={qIdx} className="bg-white/[0.02] rounded-2xl p-6 border border-white/[0.05] transition-all hover-glow">
                                <div className="flex items-center justify-between mb-6">
                                  <div className="flex flex-col">
                                    <span className="text-lg font-black" style={{color: "var(--secondary-light)"}}>
                                      {q.title}
                                    </span>
                                    <span className="text-[10px] text-[var(--text-dim)] font-black uppercase tracking-widest mt-0.5">
                                      {q.size}
                                    </span>
                                  </div>
                                  <div className="w-8 h-8 rounded-xl bg-[var(--secondary)]/10 flex items-center justify-center">
                                    <Download size={16} style={{color: "var(--secondary-light)"}} />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {q.urls.map((server, sIdx) => (
                                    <a
                                      key={sIdx}
                                      href={server.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-center text-[var(--text-secondary)] hover:text-white transition-all uppercase tracking-tighter hover-glow"
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
                    <div className="p-10 text-center text-red-400 text-sm font-bold">
                      Gagal memuat data batch. Coba lagi nanti.
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Synopsis */}
            <section>
              <h2 className="section-title mb-6">Sinopsis</h2>
              <div className="glass p-8 rounded-2xl border border-[var(--border)] space-y-6 shadow-xl">
                {data.synopsis ? (
                  typeof data.synopsis === "string" ? (
                    <p className="text-[var(--text-secondary)] text-[15px] leading-8 font-medium">{data.synopsis}</p>
                  ) : (
                    data.synopsis.paragraphs?.map((p, i) => (
                      <p key={i} className="text-[var(--text-secondary)] text-[15px] leading-8 font-medium animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                        {p}
                      </p>
                    ))
                  )
                ) : (
                  <p className="italic text-[var(--text-dim)] text-center py-4 font-medium">Sinopsis belum tersedia.</p>
                )}
              </div>
            </section>

            {/* Episode List */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-title">Daftar Episode</h2>
                <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest">
                  {data.episodeList.length} Items
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleEpisodes.map((ep, idx) => (
                  <Link
                    key={idx}
                    href={`/anime/episode/${cleanEpisodeSlug(ep.href)}`}
                    prefetch={false}
                    className="group relative glass p-5 rounded-2xl border border-white/[0.04] hover:bg-white/[0.02] transition-all overflow-hidden flex flex-col justify-between min-h-[130px] hover-glow"
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" style={{background: "var(--secondary-glow-soft)"}} />
                    <div className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{background: "linear-gradient(180deg, var(--primary), var(--secondary))"}} />

                    <div className="flex items-start justify-between gap-3 relative z-10 w-full mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-[var(--text-secondary)] group-hover:text-white line-clamp-2 transition-colors">
                          {ep.title}
                        </p>
                        <p className="text-[10px] text-[var(--text-dim)] uppercase font-black tracking-widest mt-2 flex items-center gap-2">
                          <Clock size={12} /> {ep.date}
                        </p>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 transition-all group-hover:bg-[var(--primary)]/10 group-hover:border-[var(--border-glow)]" style={{color: "var(--secondary-light)"}}>
                        <Play size={15} fill="currentColor" className="ml-0.5" />
                      </div>
                    </div>
                    <div className="relative z-10 mt-auto">
                      <span className="inline-flex px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors border" style={{
                        color: "var(--secondary-light)",
                        background: "rgba(124,58,237,0.1)",
                        borderColor: "rgba(124,58,237,0.2)",
                      }}>
                        EPISODE {ep.eps}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              {data.episodeList.length > 12 && (
                <button
                  onClick={() => setShowAllEpisodes(!showAllEpisodes)}
                  className="w-full py-4 mt-6 glass rounded-xl border border-white/5 text-[10px] font-black hover:bg-white/[0.04] transition-all uppercase tracking-[0.3em] shadow-lg"
                  style={{color: "var(--secondary-light)"}}
                >
                  {showAllEpisodes ? "Sembunyikan" : `Lihat Semua Episode (${data.episodeList.length})`}
                </button>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-10">
            {/* Genre */}
            <section>
              <h2 className="section-title mb-6">Genre</h2>
              <div className="flex flex-wrap gap-2">
                {data.genreList.map((g, i) => (
                  <span
                    key={i}
                    className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-[var(--text-secondary)] hover:text-white transition-all uppercase tracking-widest hover-glow cursor-default"
                  >
                    {g.title}
                  </span>
                ))}
              </div>
            </section>

            {/* Recommendations */}
            {data.recommendedAnimeList && data.recommendedAnimeList.length > 0 && (
              <section>
                <h2 className="section-title mb-6">Rekomendasi</h2>
                <div className="space-y-5">
                  {data.recommendedAnimeList.slice(0, 5).map((anime, i) => (
                    <Link
                      key={i}
                      href={`/anime/${cleanAnimeSlug(anime.href)}`}
                      prefetch={false}
                      className="group flex gap-4 h-24 hover:bg-white/[0.02] p-2 rounded-2xl transition-all border border-transparent hover:border-white/5"
                    >
                      <div className="w-16 h-full rounded-xl overflow-hidden flex-shrink-0 shadow-lg border border-white/10 relative">
                        <Image src={anime.poster} alt={anime.title} fill sizes="4rem" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex-1 py-1 flex flex-col justify-center">
                        <h4 className="text-[13px] font-black text-[var(--text-secondary)] group-hover:text-white line-clamp-2 leading-snug transition-colors">
                          {anime.title}
                        </h4>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background: "var(--primary)"}} />
                          <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest">Recommended</span>
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
