"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Sparkles, Play } from "lucide-react";

/* ── Interfaces ──────────────────────────── */

type Genre = { title: string; genreId: string; href: string };
export type SearchAnime = {
  title: string; poster: string; type: string;
  status: string; score: string; animeId: string;
  href: string; genreList: Genre[];
};
type SearchResponse = { status: string; data: { animeList: SearchAnime[] } };

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden glass">
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

function SearchContent({
  initialQuery, initialResults, initialError,
}: {
  initialQuery: string; initialResults: SearchAnime[] | null; initialError: string | null;
}) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<SearchAnime[] | null>(initialResults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const cleanSlug = (href: string) => href.replace(/^\/samehadaku\/anime\//, "");

  useEffect(() => {
    if (!query) return;
    if (query === initialQuery && initialResults) return;
    async function fetchResults() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/anime/samehadaku?resource=search&q=${encodeURIComponent(query)}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Gagal mengambil hasil pencarian");
        const json: SearchResponse = await res.json();
        setResults(json.data?.animeList || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Gagal mengambil hasil pencarian");
      } finally { setLoading(false); }
    }
    fetchResults();
  }, [query, initialQuery, initialResults]);

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-6">
          <Search size={28} style={{color: "var(--primary)"}} />
        </div>
        <h2 className="text-xl font-black text-[var(--text-secondary)]">Silakan masukkan kata kunci pencarian</h2>
        <p className="text-sm text-[var(--text-dim)] mt-2">Cari anime favoritmu di atas</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 border border-[var(--border-glow)] text-[10px] font-black uppercase tracking-[0.15em] mb-3" style={{color: "var(--primary)"}}>
            <Sparkles size={12} /> Pencarian
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Hasil Pencarian</h1>
          <p className="text-sm text-[var(--text-dim)] mt-1">
            Menampilkan hasil untuk <span className="font-bold italic" style={{color: "var(--secondary-light)"}}>&quot;{query}&quot;</span>
          </p>
        </div>
        {!loading && results && (
          <span className="text-xs font-medium text-[var(--text-dim)] px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit">
            {results.length} ditemukan
          </span>
        )}
      </div>

      {loading && <SearchSkeleton />}

      {error && (
        <div className="glass rounded-xl p-8 text-center animate-fade-in" style={{borderColor: "rgba(239,27,36,0.2)"}}>
          <p className="text-red-400 font-medium">⚠️ {error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary mt-4">Coba Lagi</button>
        </div>
      )}

      {!loading && results && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
          {results.map((anime) => (
            <Link key={anime.animeId} href={`/anime/${cleanSlug(anime.href)}`} prefetch={false} className="group block animate-fade-in-up">
              <div className="relative overflow-hidden rounded-xl poster-card" style={{background: "var(--bg-surface)"}}>
                <Image src={anime.poster} alt={anime.title} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                {anime.score && anime.score !== "0" && anime.score !== "?" && (
                  <div className="absolute top-2 right-2 z-10 rounded-md px-1.5 py-0.5 flex items-center gap-1" style={{background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(251,191,36,0.3)"}}>
                    <span className="text-[10px] font-black" style={{color: "var(--gold)"}}>⭐ {anime.score}</span>
                  </div>
                )}
                {anime.status && (
                  <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-lg text-white ${
                      anime.status.toLowerCase().includes("ongoing")
                        ? "bg-[var(--accent)]/80"
                        : "bg-[var(--secondary)]/80"
                    }`}>
                      {anime.status}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg" style={{background: "linear-gradient(135deg, var(--primary), var(--secondary))", boxShadow: "0 0 24px var(--primary-glow)"}}>
                    <Play size={22} fill="white" className="ml-1 text-white" />
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <h3 className="text-sm font-bold text-[var(--text-secondary)] group-hover:text-white line-clamp-2 leading-snug transition-colors">{anime.title}</h3>
                <div className="flex flex-wrap gap-1">
                  {anime.genreList?.slice(0, 2).map((genre) => (
                    <span key={genre.genreId} className="text-[9px] text-[var(--text-dim)] font-medium px-1.5 py-0.5 rounded bg-white/5 border border-white/5">{genre.title}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && results && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-2xl border-white/5 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <Search size={32} className="text-[var(--text-muted)]" />
          </div>
          <h2 className="text-xl font-black text-white">Oops! Tidak ada hasil</h2>
          <p className="text-[var(--text-dim)] mt-2 max-w-sm">
            Kami tidak dapat menemukan anime dengan judul <span className="text-gray-300 italic">&quot;{query}&quot;</span>. Coba gunakan kata kunci lain.
          </p>
          <Link href="/" prefetch={false} className="btn-glow mt-8 inline-flex items-center gap-2 px-8 py-3.5 text-xs font-black uppercase tracking-[0.15em]">
            Kembali ke Beranda
          </Link>
        </div>
      )}
    </div>
  );
}

export default function SearchPageClient({
  initialQuery, initialResults, initialError = null,
}: {
  initialQuery: string; initialResults: SearchAnime[] | null; initialError?: string | null;
}) {
  return (
    <div className="min-h-screen pt-10 pb-20" style={{background: "var(--bg-deep)"}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 rounded-full animate-spin" style={{borderColor: "rgba(124,58,237,0.3)", borderTopColor: "transparent"}} /></div>}>
          <SearchContent initialQuery={initialQuery} initialResults={initialResults} initialError={initialError} />
        </Suspense>
      </div>
    </div>
  );
}
