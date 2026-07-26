"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Sparkles } from "lucide-react";

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
    <section className="relative h-[480px] sm:h-[550px] lg:h-[650px] w-full overflow-hidden mb-16 mt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto rounded-3xl">
      <div className="relative w-full h-full group">
        {data.map((anime, idx) => (
          <div
            key={anime.animeId + idx}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              idx === currentSlide ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105"
            }`}
          >
            {/* Blurred backdrop */}
            <div className="absolute inset-0 scale-110 blur-xl opacity-30 transform-gpu">
              <Image src={anime.poster} alt="" fill className="object-cover" priority={idx === 0} />
            </div>

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] via-[var(--bg-deep)]/50 to-transparent z-10" />
            <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-r from-[var(--bg-deep)] via-[var(--bg-deep)]/30 to-transparent z-10" />
            <div className="absolute inset-0 opacity-20 bg-grid-dense z-10" />

            {/* Content */}
            <div className="relative z-20 h-full flex flex-col justify-end p-8 sm:p-12 lg:p-20 pb-16 sm:pb-24 max-w-4xl space-y-6">
              <div className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)]/10 backdrop-blur-md border border-[var(--border-glow)] text-[10px] font-black text-[var(--primary)] uppercase tracking-widest">
                  <Sparkles size={12} /> New Update
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black text-white uppercase tracking-widest">
                  Episode {anime.episodes}
                </span>
              </div>

              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] animate-fade-in-up text-gradient-anime" style={{ animationDelay: "0.2s" }}>
                {anime.title}
              </h2>

              <div className="flex items-center gap-4 pt-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                <Link
                  href={`/otakudesu/anime/${cleanSlug(anime.href)}`}
                  prefetch={false}
                  className="btn-glow inline-flex items-center gap-3 px-8 py-4 text-xs font-black uppercase tracking-widest"
                >
                  <Play size={18} fill="currentColor" /> Tonton Sekarang
                </Link>
              </div>
            </div>

            {/* Poster */}
            <div className="absolute right-12 lg:right-24 bottom-16 lg:bottom-24 hidden md:block w-48 lg:w-64 aspect-[3/4] z-20 rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-fade-in-left" style={{boxShadow: "0 0 40px var(--primary-glow)"}}>
              <Image src={anime.poster} alt={anime.title} fill className="object-cover" />
              <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]" />
            </div>
          </div>
        ))}

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {data.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className="h-1.5 transition-all duration-300 rounded-full"
              style={i === currentSlide ? {
                width: "32px",
                background: "linear-gradient(90deg, var(--primary), var(--secondary))",
                boxShadow: "0 0 8px var(--primary-glow)",
              } : {
                width: "16px",
                background: "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
