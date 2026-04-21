"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

/* ── Interfaces ──────────────────────────── */

type Genre = {
  title: string;
  genreId: string;
  href: string;
};

type SearchAnime = {
  title: string;
  poster: string;
  type: string;
  status: string;
  score: string;
  animeId: string;
  href: string;
  genreList: Genre[];
};

type SearchResponse = {
  status: string;
  data: {
    animeList: SearchAnime[];
  };
};

/* ── Components ──────────────────────────── */

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden bg-[#161933]">
          <div className="aspect-[3/4] skeleton relative" />
          <div className="p-3 space-y-2">
            <div className="h-4 w-3/4 skeleton rounded" />
            <div className="h-3 w-1/2 skeleton rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [results, setResults] = useState<SearchAnime[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanSlug = (href: string) => href.replace(/^\/samehadaku\/anime\//, "");

  useEffect(() => {
    if (!query) return;

    async function fetchResults() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`https://www.sankavollerei.com/anime/samehadaku/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Gagal mengambil hasil pencarian");
        
        const json: SearchResponse = await res.json();
        setResults(json.data?.animeList || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [query]);

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-bold text-gray-400">Silakan masukkan kata kunci pencarian</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Hasil Pencarian</h1>
          <p className="text-sm text-gray-500 mt-1">
            Menampilkan hasil untuk <span className="text-[#a29bfe] font-bold italic">"{query}"</span>
          </p>
        </div>
        {!loading && results && (
          <span className="text-xs font-medium text-gray-500 px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit">
            {results.length} ditemukan
          </span>
        )}
      </div>

      {loading && <SearchSkeleton />}

      {error && (
        <div className="glass rounded-xl p-8 border-red-500/20 text-center">
          <p className="text-red-400 font-medium">⚠️ {error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary mt-4">Coba Lagi</button>
        </div>
      )}

      {!loading && results && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
          {results.map((anime) => (
            <Link key={anime.animeId} href={`/anime/${cleanSlug(anime.href)}`} prefetch={false} className="group block animate-fade-in-up">
              <div className="poster-card aspect-[3/4]">
                <img src={anime.poster} alt={anime.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                {anime.score && anime.score !== "0" && anime.score !== "?" && (
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md rounded-md px-1.5 py-0.5 flex items-center gap-1 border border-white/10 z-10">
                    <span className="text-[10px]">⭐</span>
                    <span className="text-[10px] font-bold text-yellow-400">{anime.score}</span>
                  </div>
                )}
                {anime.status && (
                  <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-lg border border-white/10 ${
                      anime.status.toLowerCase().includes('ongoing') ? 'bg-green-600/80 text-white' : 'bg-[#6c5ce7]/80 text-white'
                    }`}>
                      {anime.status}
                    </span>
                    {anime.type && (
                      <span className="text-[8px] font-bold uppercase px-1.2 py-0.2 rounded bg-white/10 backdrop-blur-md text-gray-300 border border-white/5 w-fit">
                        {anime.type}
                      </span>
                    )}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <div className="w-12 h-12 rounded-full bg-[#6c5ce7]/90 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <h3 className="text-sm font-bold text-gray-200 group-hover:text-[#a29bfe] line-clamp-2 leading-snug transition-colors">{anime.title}</h3>
                <div className="flex flex-wrap gap-1">
                  {anime.genreList?.slice(0, 2).map(genre => (
                    <span key={genre.genreId} className="text-[9px] text-gray-500 font-medium px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                      {genre.title}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && results && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-2xl border-white/5">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Oops! Tidak ada hasil</h2>
          <p className="text-gray-500 mt-2 max-w-sm">
            Kami tidak dapat menemukan anime dengan judul <span className="text-gray-300 italic">"{query}"</span>. Coba gunakan kata kunci lain.
          </p>
          <Link href="/" prefetch={false} className="btn-primary mt-8">Kembali ke Beranda</Link>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#0b0d17] pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-[#6c5ce7] border-t-transparent rounded-full animate-spin"></div></div>}>
          <SearchContent />
        </Suspense>
      </div>
    </div>
  );
}
