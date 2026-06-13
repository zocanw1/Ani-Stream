"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type AnimeItem = {
  title: string;
  animeId: string;
  href: string;
  otakudesuUrl: string;
};

export type AnimeGroup = {
  startWith: string;
  animeList: AnimeItem[];
};

type UnlimitedClientProps = {
  data: AnimeGroup[];
  error?: string;
};

function cleanSlug(href: string) {
  return href.replace(/^\/anime\/anime\//, "").replace(/\/$/, "");
}

export default function UnlimitedClient({ data, error }: UnlimitedClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return data;

    return data
      .map((group) => ({
        ...group,
        animeList: group.animeList.filter((anime) =>
          anime.title.toLowerCase().includes(query),
        ),
      }))
      .filter((group) => group.animeList.length > 0);
  }, [data, searchQuery]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-12 text-center border-red-500/20">
          <h1 className="text-red-400 font-bold text-xl mb-4">Gagal Memuat Data</h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link href="/otakudesu/anime/unlimited" className="btn-primary">
            Coba Lagi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Daftar Anime Otakudesu
          </h1>
          <p className="text-gray-500 mt-2">
            Telusuri semua koleksi anime dari database Otakudesu
          </p>
        </div>

        <div className="relative max-w-md w-full">
          <input
            type="search"
            placeholder="Cari anime..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6c5ce7] transition-all"
          />
          <svg
            aria-hidden="true"
            className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {data.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-12 p-4 glass rounded-2xl border-white/5 items-center justify-center">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mr-2">
            Cepat Ke:
          </span>
          {data.map((group) => (
            <button
              key={`nav-${group.startWith}`}
              type="button"
              onClick={() =>
                document
                  .getElementById(`section-${group.startWith}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-[#6c5ce7] hover:text-white transition-all text-sm font-black text-gray-400"
            >
              {group.startWith}
            </button>
          ))}
        </div>
      )}

      {filteredData.length === 0 ? (
        <div className="glass rounded-2xl p-20 text-center">
          <p className="text-gray-500 font-bold text-xl italic">
            Anime tidak ditemukan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
          {filteredData.map((group) => (
            <section
              key={group.startWith}
              id={`section-${group.startWith}`}
              className="space-y-6 scroll-mt-24"
            >
              <div className="sticky top-20 z-10 py-2 bg-[#0b0d17]/80 backdrop-blur-sm border-b border-white/5">
                <h2 className="text-3xl font-black gradient-text inline-block">
                  {group.startWith}
                </h2>
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
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
