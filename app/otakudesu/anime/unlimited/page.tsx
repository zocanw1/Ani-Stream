"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";

interface AnimeItem {
  title: string;
  animeId: string;
  href: string;
  otakudesuUrl: string;
}

interface AnimeGroup {
  startWith: string;
  animeList: AnimeItem[];
}

export default function UnlimitedOtakudesuPage() {
  const [data, setData] = useState<AnimeGroup[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch("https://www.sankavollerei.com/anime/unlimited");
        if (!res.ok) throw new Error("Gagal mengambil daftar anime");
        const json = await res.json();
        setData(json.data.list);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchQuery) return data;

    const query = searchQuery.toLowerCase();
    return data
      .map((group) => ({
        ...group,
        animeList: group.animeList.filter((anime) =>
          anime.title.toLowerCase().includes(query)
        ),
      }))
      .filter((group) => group.animeList.length > 0);
  }, [data, searchQuery]);

  const cleanSlug = (href: string) => href.replace(/^\/anime\/anime\//, "");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Daftar Anime Otakudesu</h1>
          <p className="text-gray-500 mt-2">Telusuri semua koleksi anime dari database Otakudesu</p>
        </div>

        <div className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="Cari anime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6c5ce7] transition-all"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Alphabet / Character Index ──────────────── */}
      {!loading && data && data.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-12 p-4 glass rounded-2xl border-white/5 items-center justify-center">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mr-2">Cepat Ke:</span>
          {data.map((group) => (
            <button
              key={`nav-${group.startWith}`}
              onClick={() => {
                const el = document.getElementById(`section-${group.startWith}`);
                if (el) {
                  const offset = 80; // Account for sticky navbar
                  const bodyRect = document.body.getBoundingClientRect().top;
                  const elementRect = el.getBoundingClientRect().top;
                  const elementPosition = elementRect - bodyRect;
                  const offsetPosition = elementPosition - offset;

                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                  });
                }
              }}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-[#6c5ce7] hover:text-white transition-all text-sm font-black text-gray-400"
            >
              {group.startWith}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-8 w-12 bg-white/5 rounded-lg animate-pulse" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="h-6 w-full bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass rounded-2xl p-12 text-center border-red-500/20">
          <p className="text-red-400 font-bold text-xl mb-4">⚠️ Gagal Memuat Data</p>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Coba Lagi
          </button>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="glass rounded-2xl p-20 text-center">
          <p className="text-gray-500 font-bold text-xl italic">Anime tidak ditemukan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
          {filteredData.map((group) => (
            <div key={group.startWith} className="space-y-6" id={`section-${group.startWith}`}>
              <div className="sticky top-20 z-10 py-2 bg-[#0b0d17]/80 backdrop-blur-sm border-b border-white/5">
                <h2 className="text-3xl font-black gradient-text inline-block">{group.startWith}</h2>
              </div>
              <ul className="space-y-1">
                {group.animeList.map((anime) => (
                  <li key={anime.animeId}>
                    <Link
                      href={`/otakudesu/anime/${cleanSlug(anime.href)}`}
                      prefetch={false}
                      className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all text-sm text-gray-400 hover:text-white"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-[#6c5ce7] transition-all" />
                      <span className="truncate">{anime.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
