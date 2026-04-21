"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

type OtakudesuAnime = {
  title: string;
  poster: string;
  episodes?: number | string;
  animeId: string;
  href: string;
};

export default function HomeCarousel({ data }: { data: OtakudesuAnime[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const cleanSlug = (href: string) => href.replace(/^\/anime\/anime\//, "");

  useEffect(() => {
    if (data.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % data.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [data]);

  if (data.length === 0) return null;

  return (
    <section className="relative h-[450px] sm:h-[550px] lg:h-[650px] w-full overflow-hidden mb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto rounded-3xl mt-6">
      <div className="relative w-full h-full group">
        {data.map((anime, idx) => (
          <div
            key={anime.animeId + idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            <div className="absolute inset-0 scale-110 blur-xl opacity-30 transform-gpu translate-z-0">
              <Image src={anime.poster} alt="" fill className="object-cover" priority={idx === 0} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/40 to-transparent z-10" />
            <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-r from-[#0a0a0c] via-[#0a0a0c]/20 to-transparent z-10" />

            <div className="relative z-20 h-full flex flex-col justify-end p-8 sm:p-12 lg:p-20 pb-16 sm:pb-24 max-w-4xl space-y-6">
              <div className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <span className="px-3 py-1 rounded-lg bg-[#ff7675]/10 backdrop-blur-md border border-[#ff7675]/20 text-[10px] font-black text-[#ff7675] uppercase tracking-widest">
                  New Update
                </span>
                <span className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black text-white uppercase tracking-widest">
                  Episode {anime.episodes}
                </span>
              </div>

              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {anime.title}
              </h2>

              <div className="flex items-center gap-4 pt-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Link
                  href={`/otakudesu/anime/${cleanSlug(anime.href)}`}
                  prefetch={true}
                  className="btn-primary px-8 py-4 text-xs font-black uppercase tracking-widest flex items-center gap-3 bg-[#ff7675] hover:bg-[#ff4757] shadow-[#ff7675]/20"
                >
                  Tonton Sekarang
                </Link>
              </div>
            </div>

            <div className="absolute right-12 lg:right-24 bottom-16 lg:bottom-24 hidden md:block w-48 lg:w-64 aspect-[3/4] z-20 rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-fade-in-left">
              <Image src={anime.poster} alt={anime.title} fill className="object-cover" />
            </div>
          </div>
        ))}

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {data.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 transition-all duration-300 rounded-full ${i === currentSlide ? 'w-8 bg-[#ff7675]' : 'w-4 bg-white/20 hover:bg-white/40'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
