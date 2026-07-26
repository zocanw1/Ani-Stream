"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ChevronLeft, ChevronRight, TrendingUp, Play } from "lucide-react";

/* ── Interfaces ──────────────────────────── */

type Genre = { title: string; genreId: string; href: string };
type SamehadakuAnime = {
  title: string; poster: string; type: string;
  score: string; status: string; animeId: string;
  href: string; samehadakuUrl: string; genreList?: Genre[];
};
type Pagination = { currentPage: number; hasNextPage: boolean; hasPrevPage: boolean; totalPages: number };
export type PaginatedAnime = { animeList: SamehadakuAnime[]; pagination: Pagination };

function CardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden glass border border-white/5">
      <div className="aspect-[3/4] skeleton relative" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 skeleton rounded" />
        <div className="flex gap-2">
          <div className="h-3 w-12 skeleton rounded" />
          <div className="h-3 w-12 skeleton rounded" />
        </div>
      </div>
    </div>
  );
}

export default function PopularPageClient({ initialData }: { initialData: PaginatedAnime | null }) {
  const [data, setData] = useState<PaginatedAnime | null>(initialData);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const cleanSlug = (href: string) => href.replace(/^\/samehadaku\/anime\//, "");

  useEffect(() => {
    if (page === 1 && initialData) return;
    fetchPopularData(page);
  }, [page, initialData]);

  async function fetchPopularData(pageNum: number) {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/anime/samehadaku?resource=popular&page=${pageNum}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal mengambil data populer");
      const json = await res.json();
      setData({ animeList: json.data?.animeList || [], pagination: json.pagination });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mengambil data populer");
    } finally {
      setLoading(false);
    }
  }

  const getPageNumbers = () => {
    if (!data?.pagination) return [];
    const total = data.pagination.totalPages;
    const current = page;
    let pages: (number | string)[] = [];
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 3) pages = [1, 2, 3, 4, "...", total];
      else if (current >= total - 2) pages = [1, "...", total - 3, total - 2, total - 1, total];
      else pages = [1, "...", current - 1, current, current + 1, "...", total];
    }
    return pages;
  };

  return (
    <div className="min-h-screen pb-20">
      {/* ── Premium Header ── */}
      <section className="relative overflow-hidden mb-12">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px]" style={{background: "var(--primary-glow-soft)"}} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-[120px]" style={{background: "var(--secondary-glow-soft)"}} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="max-w-3xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 border border-[var(--border-glow)] text-[10px] font-black uppercase tracking-[0.15em] mb-4" style={{color: "var(--primary)"}}>
              <Sparkles size={12} /> Trending
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              Anime <span className="text-gradient-anime">Terpopuler</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
              Jelajahi judul-judul anime yang paling banyak ditonton dan sedang menjadi tren di komunitas saat ini.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="glass rounded-xl p-12 text-center animate-fade-in" style={{borderColor: "rgba(239,27,36,0.2)"}}>
            <p className="text-red-400 font-medium text-lg">⚠️ Gagal memuat anime populer.</p>
            <p className="text-sm text-[var(--text-dim)] mt-2 mb-6">{error}</p>
            <button onClick={() => fetchPopularData(page)} className="btn-primary">Coba Lagi</button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 15 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : data && data.animeList.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {data.animeList.map((anime, idx) => (
                <Link
                  key={anime.animeId + idx}
                  href={`/anime/${cleanSlug(anime.href)}`}
                  prefetch={false}
                  className="group block animate-fade-in"
                  style={{ animationDelay: `${(idx % 10) * 0.05}s` }}
                >
                  <div className="relative overflow-hidden rounded-xl poster-card" style={{background: "var(--bg-surface)"}}>
                    <Image src={anime.poster} alt={anime.title} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 left-2 z-10 w-8 h-8 rounded-lg backdrop-blur-md border border-white/10 flex items-center justify-center" style={{background: "rgba(0,0,0,0.6)"}}>
                      <span className="text-xs font-black italic text-gradient-anime">#{(page - 1) * data.animeList.length + idx + 1}</span>
                    </div>
                    {anime.score && anime.score !== "0" && anime.score !== "?" && (
                      <div className="absolute top-2 right-2 rounded px-1.5 py-0.5 z-10 flex items-center gap-1" style={{background: "rgba(251,191,36,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(251,191,36,0.2)"}}>
                        <span className="text-[10px] font-black text-[var(--gold)]">⭐ {anime.score}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg" style={{background: "linear-gradient(135deg, var(--primary), var(--secondary))", boxShadow: "0 0 24px var(--primary-glow)"}}>
                        <Play size={22} fill="white" className="ml-1 text-white" />
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-3 pt-12 bg-gradient-to-t from-black via-black/60 to-transparent z-10">
                      <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest">{anime.type} • {anime.status}</span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <h3 className="text-sm font-bold text-[var(--text-secondary)] group-hover:text-white line-clamp-2 leading-snug transition-colors">{anime.title}</h3>
                    <div className="flex flex-wrap gap-1">
                      {anime.genreList?.slice(0, 3).map((g, i) => (
                        <span key={i} className="text-[9px] text-[var(--text-dim)] font-bold uppercase tracking-widest">{g.title}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Premium Pagination */}
            {data.pagination && data.pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-16">
                <button
                  disabled={!data.pagination.hasPrevPage || loading}
                  onClick={() => setPage(page - 1)}
                  className="w-11 h-11 rounded-xl glass border border-white/5 flex items-center justify-center text-[var(--text-dim)] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                {getPageNumbers().map((p, i) =>
                  typeof p === "string" ? (
                    <span key={`dots-${i}`} className="text-[var(--text-muted)] px-1">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`min-w-[44px] h-11 px-2 rounded-xl text-sm font-bold transition-all ${
                        page === p ? "text-white scale-110" : "text-[var(--text-dim)] hover:text-[var(--text-secondary)] glass border border-white/5"
                      }`}
                      style={page === p ? {background: "linear-gradient(135deg, var(--primary), var(--secondary))", boxShadow: "0 0 16px var(--primary-glow)"} : {}}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  disabled={!data.pagination.hasNextPage || loading}
                  onClick={() => setPage(page + 1)}
                  className="w-11 h-11 rounded-xl glass border border-white/5 flex items-center justify-center text-[var(--text-dim)] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          !loading && <div className="py-20 text-center text-[var(--text-dim)] animate-fade-in">Data populer tidak ditemukan.</div>
        )}
      </div>
    </div>
  );
}
