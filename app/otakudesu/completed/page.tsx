import React from "react";
import AnimeCard from "@/components/common/AnimeCard";
import SkeletonCard from "@/components/common/SkeletonCard";
import Pagination from "@/components/otakudesu/Pagination";

/* ── Interfaces ──────────────────────────── */

type OtakudesuAnime = {
  title: string;
  poster: string;
  episodes?: number | string;
  score?: string;
  lastReleaseDate?: string;
  animeId: string;
  href: string;
  otakudesuUrl: string;
};

type PaginatedAnime = {
  animeList: OtakudesuAnime[];
  pagination: {
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    totalPages: number;
  };
};

/* ── Fetch Functions ─────────────────────── */

async function getCompletedData(page: number): Promise<PaginatedAnime | null> {
  try {
    const res = await fetch(`https://www.sankavollerei.com/anime/complete-anime?page=${page}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return {
      animeList: json.data?.animeList || [],
      pagination: json.pagination
    };
  } catch (err) {
    return null;
  }
}

const cleanSlug = (href: string) => href.replace(/^\/anime\/anime\//, "");

export default async function OtakudesuCompletedPage(props: { searchParams: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page || "1");
  const data = await getCompletedData(page);

  return (
    <div className="min-h-screen pb-20">
      {/* ── Header ────────────────────────────────── */}
      <section className="relative overflow-hidden mb-12">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#ff7675]/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="max-w-3xl animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Anime <span className="gradient-text !from-[#ff7675] !to-[#ff4757]">Tamat</span> (Completed)
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Daftar seluruh anime Otakudesu yang telah selesai masa tayangnya. Koleksi lengkap dari berbagai musim dan genre.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!data ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 15 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : data.animeList.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {data.animeList.map((anime, idx) => (
                <AnimeCard 
                  key={anime.animeId + idx} 
                  source="otakudesu"
                  title={anime.title}
                  poster={anime.poster}
                  href={`/otakudesu/anime/${cleanSlug(anime.href)}`} 
                  score={anime.score}
                  subText={`${anime.episodes} EPISODES • ${anime.lastReleaseDate}`}
                  className="animate-fade-in"
                  style={{ animationDelay: `${(idx % 10) * 0.05}s` } as any}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination currentPage={page} totalPages={data.pagination.totalPages} />
          </>
        ) : (
          <div className="py-20 text-center text-gray-500 animate-fade-in">Daftar anime tamat tidak ditemukan.</div>
        )}
      </div>
    </div>
  );
}
