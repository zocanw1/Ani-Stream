"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

/* ── Interfaces ──────────────────────────── */

type Genre = {
  title: string;
  genreId: string;
  href: string;
};

type SearchAnime = {
  title: string;
  poster: string;
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
        <div key={i} className="rounded-xl overflow-hidden glass border border-white/5">
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

  const cleanSlug = (href: string) => href.replace(/^\/anime\/anime\//, "");

  useEffect(() => {
    if (!query) return;

    async function fetchResults() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`https://www.sankavollerei.com/anime/search/${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Gagal mengambil hasil pencarian Otakudesu");
        
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
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
           <svg className="w-10 h-10 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <h2 className="text-xl font-bold text-gray-400">Silakan masukkan kata kunci pencarian</h2>
        <p className="text-sm text-gray-600 mt-2">Cari anime favoritmu di database Otakudesu</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Hasil Pencarian <span className="text-[#ff7675]">Otaku</span></h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            Menampilkan hasil untuk <span className="text-[#ff7675] font-black italic">"{query}"</span>
          </p>
        </div>
        {!loading && results && (
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-4 py-2 rounded-xl bg-white/5 border border-white/10 w-fit">
            {results.length} Anime Ditemukan
          </span>
        )}
      </div>

      {loading && <SearchSkeleton />}

      {error && (
        <div className="glass rounded-2xl p-12 border-red-500/20 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <p className="text-red-400 font-bold">Gagal memproses pencarian</p>
          <p className="text-sm text-gray-500 mt-1 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary bg-[#ff7675] shadow-lg shadow-[#ff7675]/20">Coba Lagi</button>
        </div>
      )}

      {!loading && results && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-8">
          {results.map((anime, idx) => (
            <Link 
                key={anime.animeId + idx} 
                href={`/otakudesu/anime/${cleanSlug(anime.href)}`} 
                prefetch={false} 
                className="group block animate-fade-in-up"
                style={{ animationDelay: `${(idx % 10) * 0.05}s` }}
            >
              <div className="poster-card aspect-[3/4] rounded-2xl overflow-hidden ring-1 ring-white/5 bg-white/5 relative">
                <Image 
                  src={anime.poster} 
                  alt={anime.title} 
                  fill
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                
                {anime.score && anime.score !== "0" && anime.score !== "?" && (
                  <div className="absolute top-3 right-3 bg-[#ff7675] rounded-lg px-2 py-1 flex items-center gap-1.5 shadow-xl z-10 border border-white/20">
                    <span className="text-[10px] font-black text-white">⭐ {anime.score}</span>
                  </div>
                )}

                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg shadow-lg border border-white/10 ${
                      anime.status.toLowerCase().includes('ongoing') ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      {anime.status}
                    </span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 translate-y-4 group-hover:translate-y-0">
                  <div className="w-14 h-14 rounded-full bg-[#ff7675] flex items-center justify-center shadow-2xl shadow-[#ff7675]/40">
                    <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-black text-gray-200 group-hover:text-[#ff7675] line-clamp-2 leading-snug transition-colors">{anime.title}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {anime.genreList?.slice(0, 3).map(genre => (
                    <span key={genre.genreId} className="text-[9px] text-gray-500 font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5">
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
        <div className="flex flex-col items-center justify-center py-24 text-center glass rounded-3xl border-white/5 shadow-2xl">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8">
            <svg className="w-12 h-12 text-gray-700" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Tidak Ada Hasil</h2>
          <p className="text-gray-500 mt-3 max-w-sm font-medium">
            Maaf, kami tidak menemukan anime <span className="text-[#ff7675] italic font-bold">"{query}"</span> di database Otakudesu. Coba kata kunci lain atau periksa ejaan Anda.
          </p>
          <Link href="/otakudesu" prefetch={false} className="btn-primary bg-[#ff7675] mt-10 shadow-lg shadow-[#ff7675]/30">Kembali ke Beranda</Link>
        </div>
      )}
    </div>
  );
}

export default function OtakudesuSearchPage() {
  return (
    <div className="min-h-screen bg-[#0b0d17] pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="flex items-center justify-center py-24"><div className="w-10 h-10 border-4 border-[#ff7675]/20 border-t-[#ff7675] rounded-full animate-spin"></div></div>}>
          <SearchContent />
        </Suspense>
      </div>
    </div>
  );
}
