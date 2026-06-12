"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import AnimeCard from "@/components/common/AnimeCard";
import SkeletonCard from "@/components/common/SkeletonCard";
import Image from "next/image";

const DAY_NAMES_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_NAMES_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

/* ── Interfaces ──────────────────────────── */

type Genre = {
  title: string;
  genreId: string;
  href: string;
};

type SamehadakuAnime = {
  title: string;
  poster: string;
  type: string;
  score: string | { value: string; users: string };
  status: string;
  animeId: string;
  href: string;
  samehadakuUrl: string;
  genreList?: Genre[];
  releasedOn?: string;
  episodes?: string;
};

type ScheduleItem = {
  title: string;
  poster: string;
  type: string;
  score: string;
  estimation: string;
  genres: string;
  animeId: string;
  href: string;
};

type DaySchedule = {
  day: string;
  animeList: ScheduleItem[];
};

export type HomeData = {
  recent: { animeList: SamehadakuAnime[] };
  movie: { animeList: SamehadakuAnime[] };
  top10: { animeList: (SamehadakuAnime & { rank: number })[] };
};

type Pagination = {
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages: number;
};

export type PaginatedAnime = {
  animeList: SamehadakuAnime[];
  pagination: Pagination;
};

export type HomePageInitialData = {
  homeData: HomeData;
  scheduleData: DaySchedule[];
  ongoingData: PaginatedAnime;
  popularData: SamehadakuAnime[];
};


export default function HomePageClient({
  initialData,
  initialError = null,
}: {
  initialData: HomePageInitialData | null;
  initialError?: string | null;
}) {
  // States
  const [homeData, setHomeData] = useState<HomeData | null>(initialData?.homeData ?? null);
  const [scheduleData, setScheduleData] = useState<DaySchedule[] | null>(initialData?.scheduleData ?? null);
  const [ongoingData, setOngoingData] = useState<PaginatedAnime | null>(initialData?.ongoingData ?? null);
  const [popularData, setPopularData] = useState<SamehadakuAnime[] | null>(initialData?.popularData ?? null);

  const [activeDay, setActiveDay] = useState("");
  const [ongoingPage, setOngoingPage] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [loading, setLoading] = useState(!initialData);
  const [loadingOngoing, setLoadingOngoing] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  // Mapping Global Date to API Days (English for Samehadaku)
  const cleanSlug = (href: string) => href.replace(/^\/samehadaku\/anime\//, "");

  useEffect(() => {
    const today = DAY_NAMES_EN[new Date().getDay()];
    setActiveDay(today);

    if (initialData) return;

    async function fetchInitialData() {
      try {
        setLoading(true);

        const [homeRes, scheduleRes, popularRes] = await Promise.all([
          fetch("https://www.sankavollerei.com/anime/samehadaku/home"),
          fetch("https://www.sankavollerei.com/anime/samehadaku/schedule"),
          fetch("https://www.sankavollerei.com/anime/samehadaku/popular")
        ]);

        if (!homeRes.ok || !scheduleRes.ok || !popularRes.ok) throw new Error("Gagal mengambil data dari server");

        const homeJson = await homeRes.json();
        const scheduleJson = await scheduleRes.json();
        const popularJson = await popularRes.json();

        setHomeData(homeJson.data);
        setScheduleData(scheduleJson.data.days);
        setPopularData(popularJson.data?.animeList?.slice(0, 7) || []);

        await fetchOngoingAnime(1);

      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : "Gagal mengambil data dari server");
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();
  }, [initialData]);

  // Auto Slide Effect
  useEffect(() => {
    if (!popularData || popularData.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % popularData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [popularData]);

  async function fetchOngoingAnime(page: number) {
    try {
      setLoadingOngoing(true);
      const res = await fetch(`https://www.sankavollerei.com/anime/samehadaku/ongoing?page=${page}`);
      if (!res.ok) throw new Error("Gagal mengambil data anime ongoing");
      const json = await res.json();

      setOngoingData({
        animeList: json.data?.animeList || [],
        pagination: json.pagination
      });
      setOngoingPage(page);
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setLoadingOngoing(false);
    }
  }

  const activeDayList = useMemo(() => {
    if (!scheduleData) return [];
    return scheduleData.find(d => d.day === activeDay)?.animeList || [];
  }, [scheduleData, activeDay]);

  // Pagination Helper
  const getPageNumbers = () => {
    if (!ongoingData?.pagination) return [];
    const total = ongoingData.pagination.totalPages;
    const current = ongoingPage;
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
    <div className="min-h-screen bg-[#050505] pb-20 text-white">
      {/* ── Hero Carousel Section ───────────────────── */}
      <section className="relative h-[560px] sm:h-[590px] lg:h-[690px] w-full overflow-hidden mb-12 bg-[#050505]">
        {!popularData ? (
          <div className="relative w-full h-full bg-[#050505] p-8 sm:p-12 lg:p-16 overflow-hidden">
            <div className="grid h-full items-center gap-10 lg:grid-cols-[1fr_420px]">
              <div className="relative z-10 max-w-[290px] space-y-6 sm:max-w-none">
                <span className="inline-flex rounded bg-[#E50914] px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-white">
                  Streaming Mode
                </span>
                <h1 className="max-w-full text-4xl font-black leading-tight text-white sm:max-w-3xl sm:text-7xl">
                  Streaming anime tanpa jeda.
                </h1>
                <p className="max-w-xl text-sm font-bold leading-7 text-neutral-300 sm:text-base">
                  Jelajahi update terbaru, jadwal rilis, film anime, dan riwayat tontonan dengan tampilan sinematik.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="btn-primary inline-flex">Mulai Jelajah</span>
                  <span className="btn-ghost inline-flex">Lihat Jadwal</span>
                </div>
              </div>
              <div className="relative z-10 hidden rounded-lg border border-white/10 bg-[#141414] p-5 shadow-2xl lg:block">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-[#E50914]">Preview</p>
                    <p className="text-lg font-black text-white">Anime Dashboard</p>
                  </div>
                  <span className="rounded bg-[#E50914] px-3 py-1 text-xs font-black text-white">Live</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="aspect-[3/4] rounded bg-[#1f1f1f]" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : popularData.length > 0 ? (
          <div className="relative w-full h-full group">
            {popularData.map((anime, idx) => (
              <div
                key={anime.animeId + idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
              >
                {/* Background Poster (Scaled & Blurred) */}
                <div className="absolute inset-0 scale-110 blur-xl opacity-30 transform-gpu translate-z-0">
                  <Image src={anime.poster} alt="" fill sizes="100vw" className="object-cover" priority={idx === 0} />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/40 to-transparent z-10" />
                <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-r from-[#0a0a0c] via-[#0a0a0c]/20 to-transparent z-10" />

                <div className="relative z-20 h-full flex flex-col justify-end p-8 sm:p-12 lg:p-20 pb-16 sm:pb-24 max-w-4xl space-y-6">
                  <div className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <span className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black text-white uppercase tracking-widest">
                      #{idx + 1} Terpopuler
                    </span>
                    {anime.score && (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-yellow-500/10 backdrop-blur-md border border-yellow-500/20 text-[10px] font-black text-yellow-500 uppercase tracking-widest">
                        ⭐ {typeof anime.score === 'string' ? anime.score : anime.score.value}
                      </span>
                    )}
                  <span className="px-3 py-1 rounded bg-[#E50914] backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest">
                      {anime.type}
                    </span>
                  </div>

                  <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {anime.title}
                  </h2>

                  <div className="flex flex-wrap gap-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    {anime.genreList?.slice(0, 4).map((g, i) => (
                      <span key={i} className="text-xs font-black text-white after:content-['•'] after:ml-2 last:after:content-none">
                        {g.title}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 pt-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <Link
                      href={`/anime/${cleanSlug(anime.href)}`}
                      prefetch={false}
                      className="btn-primary px-8 py-4 text-xs font-black uppercase tracking-widest flex items-center gap-3 group/btn"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      Tonton Sekarang
                    </Link>
                  </div>
                </div>

                {/* Main Poster Image (Floating on Right) */}
                  <div className="absolute right-12 lg:right-24 bottom-16 lg:bottom-24 hidden md:block w-48 lg:w-64 aspect-[3/4] z-20 rounded-md overflow-hidden border border-white/20 shadow-2xl animate-fade-in-left">
                  <Image src={anime.poster} alt={anime.title} fill sizes="(max-width: 1024px) 12rem, 16rem" className="object-cover" priority={idx === 0} />
                </div>
              </div>
            ))}

            {/* Carousel Navigation Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
              {popularData.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 transition-all duration-300 rounded-full ${i === currentSlide ? 'w-8 bg-[#E50914]' : 'w-4 bg-white/40 hover:bg-white'}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center glass rounded-3xl">
            <p className="text-[#1E1B29] font-black italic">Belum ada anime populer hari ini.</p>
          </div>
        )}
      </section>

      {/* ── Main Content ──────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">

        {error && (
          <div className="glass rounded-xl p-8 border-red-500/20 text-center animate-fade-in-up">
            <p className="text-red-400 font-medium text-lg">⚠️ Ups! Ada kendala saat memuat data.</p>
            <p className="text-sm text-[#1E1B29] mt-2 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary">Muat Ulang</button>
          </div>
        )}

        {/* 1. SCHEDULE SECTION (Jadwal Rilis) */}
        {!loading && scheduleData && (
          <section className="animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h2 className="section-title">Jadwal Rilis Minggu Ini</h2>
                <p className="text-sm font-extrabold text-[#1E1B29]/75 mt-1">Cek jadwal anime kesayanganmu</p>
              </div>

              {/* Day Tabs */}
              <div className="flex flex-wrap gap-2 p-1.5 glass rounded-xl w-fit">
                {DAY_NAMES_EN.map((day, idx) => (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`px-4 py-2 rounded-lg border-[3px] text-xs font-black transition-all ${activeDay === day
                      ? "bg-[#FDCB6E] text-[#1E1B29] border-[#1E1B29] shadow-[4px_4px_0_#1E1B29] scale-105"
                      : "text-[#1E1B29] border-transparent hover:bg-white"
                      }`}
                  >
                    {day === DAY_NAMES_EN[new Date().getDay()] ? `Hari Ini` : DAY_NAMES_ID[idx]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {activeDayList.map((anime, idx) => (
                <AnimeCard 
                  key={anime.animeId + idx}
                  source="samehadaku"
                  title={anime.title}
                  poster={anime.poster}
                  href={`/anime/${cleanSlug(anime.href)}`}
                  score={anime.score}
                  type={anime.type}
                  className="animate-fade-in-up"
                />
              ))}
              {activeDayList.length === 0 && (
                <div className="col-span-full py-12 text-center text-[#1E1B29] italic font-black">Tidak ada jadwal rilis hari ini.</div>
              )}
            </div>
          </section>
        )}

        {/* 2. TOP 10 SECTION (New) */}
        {!loading && homeData && (
          <section className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="section-title">Trending Sekarang (Top 10)</h2>
                <p className="text-sm font-extrabold text-[#1E1B29]/75 mt-1">Anime paling populer minggu ini</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
              {homeData.top10.animeList.map((anime, idx) => (
                <div key={anime.animeId + idx} className="relative">
                  <div className="absolute top-2 left-2 bg-[#FDCB6E] backdrop-blur-md rounded-lg w-9 h-9 flex items-center justify-center border-[3px] border-[#1E1B29] shadow-[3px_3px_0_#1E1B29] z-20 pointer-events-none">
                    <span className="text-lg font-black italic gradient-text">#{idx + 1}</span>
                  </div>
                  <AnimeCard 
                    source="samehadaku"
                    title={anime.title}
                    poster={anime.poster}
                    href={`/anime/${cleanSlug(anime.href)}`}
                    score={typeof anime.score === 'string' ? anime.score : anime.score?.value || ""}
                    type={anime.type}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2.5 RECENT SECTION (Baru Ditambahkan) */}
        {!loading && homeData?.recent?.animeList && homeData.recent.animeList.length > 0 && (
          <section className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="section-title">Baru Ditambahkan</h2>
                <p className="text-sm font-extrabold text-[#1E1B29]/75 mt-1">Update rilis episode hari ini</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
              {homeData.recent.animeList.slice(0, 5).map((anime, idx) => (
                <AnimeCard 
                  key={anime.animeId + idx}
                  source="samehadaku"
                  title={anime.title}
                  poster={anime.poster}
                  href={`/anime/${cleanSlug(anime.href)}`}
                  score={typeof anime.score === 'string' ? anime.score : anime.score?.value || ""}
                  episodes={anime.episodes}
                  subText={anime.releasedOn}
                />
              ))}
            </div>
          </section>
        )}

        {/* 2.6 MOVIE SECTION */}
        {!loading && homeData?.movie?.animeList && homeData.movie.animeList.length > 0 && (
          <section className="animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="section-title">Film Anime (Movie)</h2>
                <p className="text-sm font-extrabold text-[#1E1B29]/75 mt-1">Tontonan teater terbaik untuk akhir pekan</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
              {homeData.movie.animeList.slice(0, 5).map((anime, idx) => (
                <AnimeCard 
                  key={anime.animeId + idx}
                  source="samehadaku"
                  title={anime.title}
                  poster={anime.poster}
                  href={`/anime/${cleanSlug(anime.href)}`}
                  subText="MOVIE"
                />
              ))}
            </div>
          </section>
        )}

        {/* 3. ONGOING SECTION (Samehadaku API) */}
        <section className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title">Update Terbaru (Ongoing)</h2>
              <p className="text-sm font-extrabold text-[#1E1B29]/75 mt-1">Nonton episode terbaru yang rilis hari ini</p>
            </div>
          </div>

          {(loading && !ongoingData) ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
              {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6 transition-opacity duration-300 ${loadingOngoing ? 'opacity-40' : 'opacity-100'}`}>
              {ongoingData?.animeList.map((anime, idx) => (
                <AnimeCard 
                  key={anime.animeId + idx}
                  source="samehadaku"
                  title={anime.title}
                  poster={anime.poster}
                  href={`/anime/${cleanSlug(anime.href)}`}
                  score={typeof anime.score === 'string' ? anime.score : anime.score?.value || ""}
                  status={anime.status}
                  type={anime.type}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && ongoingData?.pagination && (
            <div className="flex justify-center items-center gap-2 mt-12 pb-10">
              <button
                disabled={!ongoingData.pagination.hasPrevPage || loadingOngoing}
                onClick={() => fetchOngoingAnime(ongoingPage - 1)}
                className="w-10 h-10 rounded-xl glass flex items-center justify-center text-[#1E1B29] hover:text-[#FF7675] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>

              {getPageNumbers().map((p, i) => (
                typeof p === "string" ? (
                  <span key={`dots-${i}`} className="text-[#1E1B29] px-1 font-black">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => fetchOngoingAnime(p as number)}
                    className={`min-w-[40px] h-10 px-2 rounded-lg text-sm font-bold transition-all ${ongoingPage === p
                      ? "bg-[#FF7675] text-white border-[3px] border-[#1E1B29] shadow-[4px_4px_0_#1E1B29] scale-110"
                      : "text-[#1E1B29] hover:text-[#FF7675] glass"
                      }`}
                  >
                    {p}
                  </button>
                )
              ))}

              <button
                disabled={!ongoingData.pagination.hasNextPage || loadingOngoing}
                onClick={() => fetchOngoingAnime(ongoingPage + 1)}
                className="w-10 h-10 rounded-xl glass flex items-center justify-center text-[#1E1B29] hover:text-[#FF7675] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
