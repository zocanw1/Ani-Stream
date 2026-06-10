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
  const hoverText = source === "otakudesu" ? "group-hover:text-[#FF7675]" : "group-hover:text-[#6C5CE7]";
  const badgeBg = source === "otakudesu" ? "bg-[#FF7675]" : "bg-[#00CEC9]";

  return (
    <Link 
      href={href} 
      prefetch={true} 
      className={`group block animate-fade-in-up ${className}`}
      style={style}
    >
      <div className="poster-card aspect-[3/4] rounded-2xl overflow-hidden">
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
             <div className={`${badgeBg} rounded-lg px-2 py-0.5 border-[3px] border-[#1E1B29] shadow-[3px_3px_0_#1E1B29]`}>
                <span className="text-[10px] font-black text-[#1E1B29] italic tracking-tighter uppercase">
                   {typeof episodes === 'number' || !isNaN(Number(episodes)) ? `EPS ${episodes}` : episodes}
                </span>
             </div>
          )}
          {type && (
            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-lg bg-[#FDCB6E] backdrop-blur-md text-[#1E1B29] border-[2px] border-[#1E1B29] w-fit">
              {type}
            </span>
          )}
        </div>

        {score && score !== "0" && score !== "?" && (
          <div className="absolute top-2 right-2 bg-white backdrop-blur-md rounded-lg px-2 py-0.5 flex items-center gap-1 border-[2px] border-[#1E1B29] z-10">
            <span className="text-[10px]">⭐</span>
            <span className="text-[10px] font-bold text-yellow-400">{score}</span>
          </div>
        )}

        {/* Play Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 translate-y-4 group-hover:translate-y-0">
          <div className={`w-12 h-12 rounded-full ${badgeBg} border-[3px] border-[#1E1B29] flex items-center justify-center shadow-[4px_4px_0_#1E1B29]`}>
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <h3 className={`text-sm font-black text-[#1E1B29] ${hoverText} line-clamp-2 leading-snug transition-colors`}>
          {title}
        </h3>
        <div className="flex items-center gap-2">
           {status && (
             <span className="text-[10px] text-[#1E1B29]/70 font-black uppercase tracking-wider">{status}</span>
           )}
           {subText && (
             <>
               <span className="w-1 h-1 rounded-full bg-[#1E1B29]" />
               <span className="text-[10px] text-[#1E1B29]/70 font-black uppercase tracking-wider">{subText}</span>
             </>
           )}
        </div>
      </div>
    </Link>
  );
}
