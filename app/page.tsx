"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import AnimeCard from "@/components/common/AnimeCard";
import SkeletonCard from "@/components/common/SkeletonCard";

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

type HomeData = {
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

type PaginatedAnime = {
  animeList: SamehadakuAnime[];
  pagination: Pagination;
};


export default function HomePage() {
  // States
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [scheduleData, setScheduleData] = useState<DaySchedule[] | null>(null);
  const [ongoingData, setOngoingData] = useState<PaginatedAnime | null>(null);
  const [popularData, setPopularData] = useState<SamehadakuAnime[] | null>(null);

  const [activeDay, setActiveDay] = useState("");
  const [ongoingPage, setOngoingPage] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingOngoing, setLoadingOngoing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mapping Global Date to API Days (English for Samehadaku)
  const dayNamesEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayNamesId = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const cleanSlug = (href: string) => href.replace(/^\/samehadaku\/anime\//, "");

  useEffect(() => {
    const today = dayNamesEn[new Date().getDay()];
    setActiveDay(today);

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

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();
  }, []);

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
    } catch (err: any) {
      console.error(err.message);
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
    <div className="min-h-screen pb-20">
      {/* ── Hero Carousel Section ───────────────────── */}
      <section className="relative h-[450px] sm:h-[550px] lg:h-[650px] w-full overflow-hidden mb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto rounded-3xl mt-6">
        {!popularData ? (
          <div className="w-full h-full skeleton rounded-3xl" />
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
                  <img src={anime.poster} alt="" className="w-full h-full object-cover" />
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
                    <span className="px-3 py-1 rounded-lg bg-[#6c5ce7]/20 backdrop-blur-md border border-[#6c5ce7]/30 text-[10px] font-black text-[#a29bfe] uppercase tracking-widest">
                      {anime.type}
                    </span>
                  </div>

                  <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {anime.title}
                  </h2>

                  <div className="flex flex-wrap gap-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    {anime.genreList?.slice(0, 4).map((g, i) => (
                      <span key={i} className="text-xs font-bold text-gray-400 after:content-['•'] after:ml-2 last:after:content-none">
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
                    <button className="hidden sm:flex px-6 py-4 rounded-xl glass border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/5 transition-all">
                      + Favorite
                    </button>
                  </div>
                </div>

                {/* Main Poster Image (Floating on Right) */}
                <div className="absolute right-12 lg:right-24 bottom-16 lg:bottom-24 hidden md:block w-48 lg:w-64 aspect-[3/4] z-20 rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-fade-in-left">
                  <img src={anime.poster} alt={anime.title} className="w-full h-full object-cover" />
                </div>
              </div>
            ))}

            {/* Carousel Navigation Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
              {popularData.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 transition-all duration-300 rounded-full ${i === currentSlide ? 'w-8 bg-[#6c5ce7]' : 'w-4 bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center glass rounded-3xl">
            <p className="text-gray-500 font-bold italic">Belum ada anime populer hari ini.</p>
          </div>
        )}
      </section>

      {/* ── Main Content ──────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">

        {error && (
          <div className="glass rounded-xl p-8 border-red-500/20 text-center animate-fade-in-up">
            <p className="text-red-400 font-medium text-lg">⚠️ Ups! Ada kendala saat memuat data.</p>
            <p className="text-sm text-gray-500 mt-2 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary">Muat Ulang</button>
          </div>
        )}

        {/* 1. SCHEDULE SECTION (Jadwal Rilis) */}
        {!loading && scheduleData && (
          <section className="animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h2 className="section-title">Jadwal Rilis Minggu Ini</h2>
                <p className="text-sm text-gray-500 mt-1">Cek jadwal anime kesayanganmu</p>
              </div>

              {/* Day Tabs */}
              <div className="flex flex-wrap gap-2 p-1.5 glass rounded-xl w-fit">
                {dayNamesEn.map((day, idx) => (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeDay === day
                      ? "bg-[#6c5ce7] text-white shadow-lg shadow-[#6c5ce7]/20 scale-105"
                      : "text-gray-500 hover:text-white"
                      }`}
                  >
                    {day === dayNamesEn[new Date().getDay()] ? `Hari Ini` : dayNamesId[idx]}
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
                <div className="col-span-full py-12 text-center text-gray-600 italic font-medium">Tidak ada jadwal rilis hari ini.</div>
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
                <p className="text-sm text-gray-500 mt-1">Anime paling populer minggu ini</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
              {homeData.top10.animeList.map((anime, idx) => (
                <div key={anime.animeId + idx} className="relative">
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md rounded-lg w-8 h-8 flex items-center justify-center border border-white/10 z-20 pointer-events-none">
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
                <p className="text-sm text-gray-500 mt-1">Update rilis episode hari ini</p>
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
                <p className="text-sm text-gray-500 mt-1">Tontonan teater terbaik untuk akhir pekan</p>
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
              <p className="text-sm text-gray-500 mt-1">Nonton episode terbaru yang rilis hari ini</p>
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
                className="w-10 h-10 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>

              {getPageNumbers().map((p, i) => (
                typeof p === "string" ? (
                  <span key={`dots-${i}`} className="text-gray-600 px-1">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => fetchOngoingAnime(p as number)}
                    className={`min-w-[40px] h-10 px-2 rounded-lg text-sm font-bold transition-all ${ongoingPage === p
                      ? "bg-[#6c5ce7] text-white shadow-lg shadow-[#6c5ce7]/30 scale-110"
                      : "text-gray-500 hover:text-gray-300 glass"
                      }`}
                  >
                    {p}
                  </button>
                )
              ))}

              <button
                disabled={!ongoingData.pagination.hasNextPage || loadingOngoing}
                onClick={() => fetchOngoingAnime(ongoingPage + 1)}
                className="w-10 h-10 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
