import React from "react";
import Link from "next/link";
import Image from "next/image";

interface AnimeCardProps {
  title: string;
  poster: string;
  href: string;
  score?: string | number;
  status?: string;
  type?: string;
  episodes?: string | number;
  subText?: string;
  source: "samehadaku" | "otakudesu";
  className?: string;
  style?: React.CSSProperties;
}

export default function AnimeCard({
  title,
  poster,
  href,
  score,
  status,
  type,
  episodes,
  subText,
  source,
  className = "",
  style
}: AnimeCardProps) {
  const accentColor = source === "otakudesu" ? "#ff7675" : "#6c5ce7";
  const hoverText = source === "otakudesu" ? "group-hover:text-[#ff7675]" : "group-hover:text-[#a29bfe]";
  const badgeBg = source === "otakudesu" ? "bg-[#ff7675]" : "bg-[#6c5ce7]";

  return (
    <Link 
      href={href} 
      prefetch={true} 
      className={`group block animate-fade-in-up ${className}`}
      style={style}
    >
      <div className="poster-card aspect-[3/4] rounded-xl overflow-hidden ring-1 ring-white/5 bg-white/5">
        <Image 
          src={poster} 
          alt={title} 
          fill
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
          {episodes && (
             <div className={`${badgeBg} rounded px-2 py-0.5 shadow-lg border border-white/10`}>
                <span className="text-[10px] font-black text-white italic tracking-tighter uppercase">
                   {typeof episodes === 'number' || !isNaN(Number(episodes)) ? `EPS ${episodes}` : episodes}
                </span>
             </div>
          )}
          {type && (
            <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/10 backdrop-blur-md text-gray-200 border border-white/5 w-fit">
              {type}
            </span>
          )}
        </div>

        {score && score !== "0" && score !== "?" && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md rounded-lg px-2 py-0.5 flex items-center gap-1 border border-white/10 z-10">
            <span className="text-[10px]">⭐</span>
            <span className="text-[10px] font-bold text-yellow-400">{score}</span>
          </div>
        )}

        {/* Play Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 translate-y-4 group-hover:translate-y-0">
          <div className={`w-12 h-12 rounded-full ${badgeBg} flex items-center justify-center shadow-lg shadow-black/40`}>
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <h3 className={`text-sm font-bold text-gray-200 ${hoverText} line-clamp-2 leading-snug transition-colors`}>
          {title}
        </h3>
        <div className="flex items-center gap-2">
           {status && (
             <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{status}</span>
           )}
           {subText && (
             <>
               <span className="w-1 h-1 rounded-full bg-gray-700" />
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{subText}</span>
             </>
           )}
        </div>
      </div>
    </Link>
  );
}
