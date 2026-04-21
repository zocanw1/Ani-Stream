import React, { Suspense } from "react";
import Link from "next/link";
import HomeCarousel from "@/components/otakudesu/HomeCarousel";
import ScheduleSection from "@/components/otakudesu/ScheduleSection";
import AnimeCard from "@/components/common/AnimeCard";
import SkeletonCard from "@/components/common/SkeletonCard";
import Pagination from "@/components/otakudesu/Pagination";

/* ── Interfaces ──────────────────────────── */

type OtakudesuAnime = {
  title: string;
  poster: string;
  episodes?: number | string;
  releaseDay?: string;
  latestReleaseDate?: string;
  lastReleaseDate?: string;
  score?: string;
  animeId: string;
  href: string;
  otakudesuUrl: string;
};

type OtakudesuDaySchedule = {
  day: string;
  anime_list: {
    title: string;
    slug: string;
    url: string;
    poster: string;
  }[];
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

async function getHomeData() {
  const res = await fetch("https://www.sankavollerei.com/anime/home", { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

async function getScheduleData() {
  const res = await fetch("https://www.sankavollerei.com/anime/schedule", { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

async function getOngoingAnime(page: number) {
  const res = await fetch(`https://www.sankavollerei.com/anime/ongoing-anime?page=${page}`, { next: { revalidate: 1800 } });
  if (!res.ok) return null;
  const json = await res.json();
  return {
    animeList: json.data?.animeList || [],
    pagination: json.pagination
  };
}

async function getCompletedAnime(page: number) {
  const res = await fetch(`https://www.sankavollerei.com/anime/complete-anime?page=${page}`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const json = await res.json();
  return {
    animeList: json.data?.animeList || [],
    pagination: json.pagination
  };
}

const cleanSlug = (href: string) => href.replace(/^\/anime\/anime\//, "");

export default async function OtakudesuPage(props: { searchParams: Promise<{ ongoing_page?: string, completed_page?: string }> }) {
  const searchParams = await props.searchParams;
  const ongoingPage = parseInt(searchParams.ongoing_page || "1");
  const completedPage = parseInt(searchParams.completed_page || "1");

  // Fetch all initial data in parallel
  const [homeData, scheduleData, ongoingData, completedData] = await Promise.all([
    getHomeData(),
    getScheduleData(),
    getOngoingAnime(ongoingPage),
    getCompletedAnime(completedPage)
  ]);

  const carouselData = homeData?.ongoing?.animeList?.slice(0, 7) || [];

  return (
    <div className="min-h-screen pb-20">
      {/* ── Hero Carousel Section ── */}
      <HomeCarousel data={carouselData} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* 1. SCHEDULE SECTION */}
        {scheduleData && <ScheduleSection data={scheduleData} />}

        {/* 2. ONGOING SECTION */}
        <section id="ongoing-section" className="animate-fade-in-up scroll-mt-24">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title before:bg-[#ff7675]">Ongoing Terupdate</h2>
              <p className="text-sm text-gray-500 mt-1">Anime yang sedang tayang (Otakudesu)</p>
            </div>
          </div>
          
          {!ongoingData ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
              {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
                {ongoingData.animeList.map((anime: any, idx: number) => (
                  <AnimeCard 
                    key={anime.animeId + idx}
                    source="otakudesu"
                    title={anime.title}
                    poster={anime.poster}
                    href={`/otakudesu/anime/${cleanSlug(anime.href)}`}
                    episodes={anime.episodes}
                    subText={`${anime.latestReleaseDate} • ${anime.releaseDay}`}
                  />
                ))}
              </div>

              <Pagination 
                currentPage={ongoingPage} 
                totalPages={ongoingData.pagination.totalPages} 
                sectionId="ongoing-section" 
                paramName="ongoing_page" 
              />
            </>
          )}
        </section>

        {/* 3. COMPLETED SECTION */}
        <section id="completed-section" className="animate-fade-in-up scroll-mt-24">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title before:bg-[#ff7675]">Tamat (Completed)</h2>
              <p className="text-sm text-gray-500 mt-1">Koleksi anime yang sudah selesai tayang (Otakudesu)</p>
            </div>
            <Link 
              href="/otakudesu/completed" 
              prefetch={true}
              className="px-4 py-2 rounded-xl glass border border-white/5 text-[10px] font-bold text-gray-400 hover:text-[#ff7675] hover:border-[#ff7675]/20 transition-all uppercase tracking-widest"
            >
              Selengkapnya →
            </Link>
          </div>
          
          {!completedData ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
              {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
                {completedData.animeList.map((anime: any, idx: number) => (
                  <AnimeCard 
                    key={anime.animeId + idx}
                    source="otakudesu"
                    title={anime.title}
                    poster={anime.poster}
                    href={`/otakudesu/anime/${cleanSlug(anime.href)}`}
                    score={anime.score}
                    subText={`${anime.episodes} EPISODES • ${anime.lastReleaseDate}`}
                  />
                ))}
              </div>

              <Pagination 
                currentPage={completedPage} 
                totalPages={completedData.pagination.totalPages} 
                sectionId="completed-section" 
                paramName="completed_page" 
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
