"use client";

import React, { useState, useMemo } from "react";
import AnimeCard from "@/components/common/AnimeCard";

type OtakudesuScheduleItem = {
  title: string;
  slug: string;
  url: string;
  poster: string;
};

type OtakudesuDaySchedule = {
  day: string;
  anime_list: OtakudesuScheduleItem[];
};

export default function ScheduleSection({ data }: { data: OtakudesuDaySchedule[] }) {
  const dayNamesId = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const today = dayNamesId[new Date().getDay()];
  const [activeDay, setActiveDay] = useState(today);

  const cleanSlug = (href: string) => href.replace(/^\/anime\/anime\//, "");

  const activeDayList = useMemo(() => {
    return data.find(d => d.day === activeDay)?.anime_list || [];
  }, [data, activeDay]);

  return (
    <section className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h2 className="section-title before:bg-[#ff7675]">Jadwal Rilis Otakudesu</h2>
          <p className="text-sm text-gray-500 mt-1">Jadwal update rilis episode harian</p>
        </div>

        <div className="flex flex-wrap gap-2 p-1.5 glass rounded-xl w-fit">
          {data.map((item) => (
            <button
              key={item.day}
              onClick={() => setActiveDay(item.day)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeDay === item.day
                ? "bg-[#ff7675] text-white shadow-lg shadow-[#ff7675]/20 scale-105"
                : "text-gray-500 hover:text-white"
                }`}
            >
              {item.day}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {activeDayList.map((anime, idx) => (
          <AnimeCard 
            key={anime.slug + idx}
            source="otakudesu"
            title={anime.title}
            poster={anime.poster}
            href={`/otakudesu/anime/${cleanSlug(anime.url)}`}
            className="animate-fade-in-up"
          />
        ))}
      </div>
    </section>
  );
}
