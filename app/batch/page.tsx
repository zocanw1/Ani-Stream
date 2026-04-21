"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

/* ── Interfaces ──────────────────────────── */

type Genre = {
  title: string;
  genreId: string;
  href: string;
};

type BatchAnime = {
  title: string;
  poster: string;
  type: string;
  score: string;
  status: string;
  batchId: string;
  href: string;
  samehadakuUrl: string;
  genreList: Genre[];
};

type Pagination = {
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
  totalPages: number;
};

type BatchResponse = {
  batchList: BatchAnime[];
  pagination: Pagination;
};

/* ── Components ──────────────────────────── */

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

export default function BatchPage() {
  const [data, setData] = useState<BatchResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cleanSlug = (href: string) => href.replace(/^\/samehadaku\/batch\//, "");

  useEffect(() => {
    fetchBatchData(page);
  }, [page]);

  async function fetchBatchData(pageNum: number) {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`https://www.sankavollerei.com/anime/samehadaku/batch?page=${pageNum}`);
      if (!res.ok) throw new Error("Gagal mengambil data batch");
      const json = await res.json();
      
      setData({
        batchList: json.data?.batchList || [],
        pagination: json.pagination
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Pagination Helper
  const getPageNumbers = () => {
    if (!data?.pagination) return [];
    const total = data.pagination.totalPages;
    const current = page;
    let pages: (number | string)[] = [];
    
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 3) {
        pages = [1, 2, 3, 4, "...", total];
      } else if (current >= total - 2) {
        pages = [1, "...", total - 3, total - 2, total - 1, total];
      } else {
        pages = [1, "...", current - 1, current, current + 1, "...", total];
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen pb-20">
      {/* ── Header ────────────────────────────────── */}
      <section className="relative overflow-hidden mb-12">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#6c5ce7]/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="max-w-3xl animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Koleksi <span className="gradient-text">Anime Batch</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Download anime sekaligus satu pack (lengkap dari awal sampai akhir episode) dengan kualitas terbaik.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {error && (
          <div className="glass rounded-xl p-12 border-red-500/20 text-center animate-fade-in">
            <p className="text-red-400 font-medium text-lg">⚠️ Gagal memuat koleksi batch.</p>
            <p className="text-sm text-gray-500 mt-2 mb-6">{error}</p>
            <button onClick={() => fetchBatchData(page)} className="btn-primary">Coba Lagi</button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : data && data.batchList.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {data.batchList.map((anime, idx) => (
                <Link 
                  key={anime.batchId + idx} 
                  href={`/anime/batch/${cleanSlug(anime.href)}`} 
                  prefetch={false}
                  className="group block animate-fade-in"
                  style={{ animationDelay: `${(idx % 10) * 0.05}s` }}
                >
                  <div className="poster-card aspect-[3/4]">
                    <img src={anime.poster} alt={anime.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded px-2 py-0.5 z-10 shadow-lg border border-white/20">
                      <span className="text-[10px] font-black text-white italic tracking-tighter uppercase">BATCH</span>
                    </div>
                    {anime.score && anime.score !== "0" && (
                      <div className="absolute top-2 right-2 bg-yellow-500 rounded px-1.5 py-0.5 z-10 shadow-lg border border-white/20">
                        <span className="text-[10px] font-black text-white">⭐ {anime.score}</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-3 pt-12 bg-gradient-to-t from-black via-black/60 to-transparent z-10">
                       <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block ${
                         anime.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                       }`}>
                         {anime.status}
                       </span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <h3 className="text-sm font-bold text-gray-200 group-hover:text-[#a29bfe] line-clamp-2 leading-snug transition-colors">{anime.title}</h3>
                    <div className="flex flex-wrap gap-1">
                      {anime.genreList?.slice(0, 2).map((g, i) => (
                        <span key={i} className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{g.title}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data.pagination && data.pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-16">
                <button
                  disabled={!data.pagination.hasPrevPage || loading}
                  onClick={() => setPage(page - 1)}
                  className="w-11 h-11 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                </button>

                {getPageNumbers().map((p, i) => (
                  typeof p === "string" ? (
                    <span key={`dots-${i}`} className="text-gray-600 px-1">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`min-w-[44px] h-11 px-2 rounded-xl text-sm font-bold transition-all ${
                        page === p
                          ? "bg-[#6c5ce7] text-white shadow-lg shadow-[#6c5ce7]/30 scale-110"
                          : "text-gray-500 hover:text-gray-300 glass"
                      }`}
                    >
                      {p}
                    </button>
                  )
                ))}

                <button
                  disabled={!data.pagination.hasNextPage || loading}
                  onClick={() => setPage(page + 1)}
                  className="w-11 h-11 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </>
        ) : (
          !loading && <div className="py-20 text-center text-gray-500 animate-fade-in">Koleksi batch tidak ditemukan.</div>
        )}
      </div>
    </div>
  );
}
