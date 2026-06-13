"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, CirclePause, CirclePlay, Info, Play, Star, TrendingUp } from "lucide-react";

import AnimeCard from "@/components/common/AnimeCard";
import SkeletonCard from "@/components/common/SkeletonCard";
import ContinueWatchingShelf from "@/components/ContinueWatchingShelf";

const DAY_NAMES_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_NAMES_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

type Genre = { title: string; genreId: string; href: string };

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

type DaySchedule = { day: string; animeList: ScheduleItem[] };

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

export type PaginatedAnime = { animeList: SamehadakuAnime[]; pagination: Pagination };

export type HomePageInitialData = {
  homeData: HomeData;
  scheduleData: DaySchedule[];
  ongoingData: PaginatedAnime;
  popularData: SamehadakuAnime[];
};

function scoreValue(score: SamehadakuAnime["score"]) {
  return typeof score === "string" ? score : score?.value ?? "";
}

function cleanSlug(href: string) {
  return href.replace(/^\/samehadaku\/anime\//, "");
}

function SectionHeading({ icon: Icon, title, description, href }: {
  icon: typeof TrendingUp;
  title: string;
  description?: string;
  href?: string;
}) {
  return (
    <div className="catalog-heading">
      <div>
        <span className="catalog-heading__icon"><Icon size={17} /></span>
        <div><h2>{title}</h2>{description && <p>{description}</p>}</div>
      </div>
      {href && <Link href={href} prefetch={false}>Lihat Semua <ChevronRight size={15} /></Link>}
    </div>
  );
}

export default function HomePageClient({ initialData, initialError = null }: {
  initialData: HomePageInitialData | null;
  initialError?: string | null;
}) {
  const [data, setData] = useState<HomePageInitialData | null>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(initialError);
  const [activeDay, setActiveDay] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);

  useEffect(() => {
    setActiveDay(DAY_NAMES_EN[new Date().getDay()]);
    if (initialData) return;

    async function fetchInitialData() {
      try {
        setLoading(true);
        const [homeRes, scheduleRes, popularRes, ongoingRes] = await Promise.all([
          fetch("/api/anime/samehadaku?resource=home", { cache: "no-store" }),
          fetch("/api/anime/samehadaku?resource=schedule", { cache: "no-store" }),
          fetch("/api/anime/samehadaku?resource=popular&page=1", { cache: "no-store" }),
          fetch("/api/anime/samehadaku?resource=ongoing&page=1", { cache: "no-store" }),
        ]);
        if (![homeRes, scheduleRes, popularRes, ongoingRes].every((response) => response.ok)) throw new Error("Gagal mengambil data dari server");
        const [home, schedule, popular, ongoing] = await Promise.all([homeRes.json(), scheduleRes.json(), popularRes.json(), ongoingRes.json()]);
        setData({
          homeData: home.data,
          scheduleData: schedule.data.days,
          popularData: popular.data?.animeList?.slice(0, 7) ?? [],
          ongoingData: { animeList: ongoing.data?.animeList ?? [], pagination: ongoing.pagination },
        });
        setError(null);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Gagal mengambil data anime");
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, [initialData]);

  useEffect(() => {
    if (carouselPaused || !data?.popularData.length) return;
    const interval = window.setInterval(() => setCurrentSlide((slide) => (slide + 1) % data.popularData.length), 6500);
    return () => window.clearInterval(interval);
  }, [carouselPaused, data?.popularData.length]);

  const activeDayList = useMemo(() => {
    return data?.scheduleData.find((entry) => entry.day === activeDay)?.animeList ?? [];
  }, [activeDay, data?.scheduleData]);

  const heroAnime = data?.popularData[currentSlide];
  const slideCount = data?.popularData.length ?? 0;

  function moveSlide(direction: -1 | 1) {
    if (!slideCount) return;
    setCurrentSlide((slide) => (slide + direction + slideCount) % slideCount);
  }

  return (
    <div className="cinematic-home">
      <section className="cinematic-hero" aria-label="Anime pilihan">
        {heroAnime ? (
          <>
            <div className="cinematic-hero__backdrop">
              <Image src={heroAnime.poster} alt="" fill sizes="100vw" priority className="object-cover" />
            </div>
            <div className="cinematic-hero__veil" />
            <div className="cinematic-hero__inner">
              <div className="cinematic-hero__copy">
                <div className="hero-eyebrow">
                  <span># {currentSlide + 1} Populer</span>
                  {scoreValue(heroAnime.score) && <span><Star size={12} fill="currentColor" /> {scoreValue(heroAnime.score)}</span>}
                  {heroAnime.type && <span>{heroAnime.type}</span>}
                </div>
                <h1>{heroAnime.title}</h1>
                <div className="hero-genres">
                  {heroAnime.genreList?.slice(0, 4).map((genre) => <span key={genre.genreId}>{genre.title}</span>)}
                </div>
                <p>Ikuti kisah {heroAnime.title} dan temukan episode terbaru dengan subtitle Indonesia.</p>
                <div className="hero-actions">
                  <Link href={`/anime/${cleanSlug(heroAnime.href)}`} prefetch={false} className="btn-primary"><Play size={18} fill="currentColor" /> Tonton Sekarang</Link>
                  <Link href={`/anime/${cleanSlug(heroAnime.href)}`} prefetch={false} className="btn-secondary"><Info size={18} /> Detail Anime</Link>
                </div>
              </div>
              <div className="cinematic-hero__poster">
                <Image src={heroAnime.poster} alt={heroAnime.title} fill sizes="(max-width: 1024px) 0px, 270px" priority className="object-cover" />
              </div>
            </div>
            <button type="button" className="hero-arrow hero-arrow--left" onClick={() => moveSlide(-1)} aria-label="Anime sebelumnya"><ChevronLeft /></button>
            <button type="button" className="hero-arrow hero-arrow--right" onClick={() => moveSlide(1)} aria-label="Anime berikutnya"><ChevronRight /></button>
            <div className="hero-carousel-controls">
              <button type="button" onClick={() => setCarouselPaused((value) => !value)} aria-label={carouselPaused ? "Putar carousel" : "Jeda carousel"}>
                {carouselPaused ? <CirclePlay size={18} /> : <CirclePause size={18} />}
              </button>
              {data.popularData.map((anime, index) => (
                <button key={anime.animeId || index} type="button" onClick={() => setCurrentSlide(index)} aria-label={`Tampilkan ${anime.title}`} aria-pressed={index === currentSlide} />
              ))}
            </div>
          </>
        ) : (
          <div className="cinematic-hero__fallback">
            <span>ANISTREAM</span>
            <h1>Anime favoritmu, lebih cepat ditemukan.</h1>
            <p>Jelajahi jadwal rilis, episode terbaru, film, dan daftar tontonan dari satu tempat.</p>
            <div className="hero-actions"><a href="#jadwal-rilis" className="btn-primary"><CalendarDays size={18} /> Lihat Jadwal</a></div>
          </div>
        )}
      </section>

      <div className="cinematic-content">
        <ContinueWatchingShelf />

        {error && (
          <div className="state-panel state-panel--error" role="alert">
            <div><strong>Data anime belum dapat dimuat.</strong><span>{error}</span></div>
            <button type="button" onClick={() => window.location.reload()}>Muat Ulang</button>
          </div>
        )}

        <section id="jadwal-rilis" className="schedule-panel" aria-labelledby="schedule-title">
          <SectionHeading icon={CalendarDays} title="Jadwal Rilis Minggu Ini" description="Pilih hari untuk melihat anime yang tayang" />
          <div className="schedule-days" role="tablist" aria-label="Hari jadwal rilis">
            {DAY_NAMES_EN.map((day, index) => (
              <button key={day} type="button" role="tab" aria-selected={activeDay === day} onClick={() => setActiveDay(day)}>
                <span>{DAY_NAMES_ID[index]}</span>
                {day === DAY_NAMES_EN[new Date().getDay()] && <small>Hari ini</small>}
              </button>
            ))}
          </div>
          <div className="schedule-strip">
            {activeDayList.map((anime) => (
              <Link key={anime.animeId} href={`/anime/${cleanSlug(anime.href)}`} prefetch={false} className="schedule-item">
                <span className="schedule-item__poster"><Image src={anime.poster} alt="" fill sizes="56px" className="object-cover" /></span>
                <span><strong>{anime.title}</strong><small>{anime.estimation || anime.type}</small></span>
                <ChevronRight size={16} />
              </Link>
            ))}
            {!activeDayList.length && !loading && <p className="schedule-empty">Tidak ada jadwal pada hari ini.</p>}
          </div>
        </section>

        <section className="catalog-section" aria-labelledby="top-title">
          <SectionHeading icon={TrendingUp} title="Top 10 Minggu Ini" description="Judul yang sedang banyak ditonton" href="/popular" />
          <div className="top-ten-row">
            {data?.homeData.top10.animeList.slice(0, 10).map((anime, index) => (
              <div key={anime.animeId} className="ranked-card">
                <span className="ranked-card__rank">{index + 1}</span>
                <AnimeCard compact source="samehadaku" title={anime.title} poster={anime.poster} href={`/anime/${cleanSlug(anime.href)}`} score={scoreValue(anime.score)} type={anime.type} />
              </div>
            ))}
            {loading && Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}
          </div>
        </section>

        <div className="home-catalog-grid">
          <section className="catalog-panel">
            <SectionHeading icon={CirclePlay} title="Episode Baru" />
            <div className="catalog-panel__grid">
              {data?.homeData.recent.animeList.slice(0, 4).map((anime) => (
                <AnimeCard key={anime.animeId} compact source="samehadaku" title={anime.title} poster={anime.poster} href={`/anime/${cleanSlug(anime.href)}`} episodes={anime.episodes} subText={anime.releasedOn} />
              ))}
            </div>
          </section>
          <section className="catalog-panel">
            <SectionHeading icon={TrendingUp} title="Sedang Tayang" />
            <div className="catalog-panel__grid">
              {data?.ongoingData.animeList.slice(0, 4).map((anime) => (
                <AnimeCard key={anime.animeId} compact source="samehadaku" title={anime.title} poster={anime.poster} href={`/anime/${cleanSlug(anime.href)}`} score={scoreValue(anime.score)} status={anime.status} />
              ))}
            </div>
          </section>
          <section className="catalog-panel">
            <SectionHeading icon={Play} title="Film Anime" />
            <div className="catalog-panel__grid">
              {data?.homeData.movie.animeList.slice(0, 4).map((anime) => (
                <AnimeCard key={anime.animeId} compact source="samehadaku" title={anime.title} poster={anime.poster} href={`/anime/${cleanSlug(anime.href)}`} subText="Movie" />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
