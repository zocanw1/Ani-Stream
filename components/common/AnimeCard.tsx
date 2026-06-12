import Image from "next/image";
import Link from "next/link";
import { Play, Star } from "lucide-react";
import type { CSSProperties } from "react";

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
  style?: CSSProperties;
  compact?: boolean;
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
  style,
  compact = false,
}: AnimeCardProps) {
  const episodeText = episodes
    ? typeof episodes === "number" || !Number.isNaN(Number(episodes)) ? `Eps ${episodes}` : String(episodes)
    : "";

  return (
    <Link
      href={href}
      prefetch={false}
      className={`anime-card group focus-visible:outline-none ${compact ? "anime-card--compact" : ""} ${className}`}
      style={style}
      aria-label={`Buka ${title}`}
    >
      <span className="anime-card__media poster-card">
        <Image
          src={poster}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 25vw, 16vw"
        />
        <span className="anime-card__shade" />
        <span className="anime-card__badges">
          {episodeText && <span className="anime-badge anime-badge--accent">{episodeText}</span>}
          {type && <span className="anime-badge">{type}</span>}
        </span>
        {score && score !== "0" && score !== "?" && (
          <span className="anime-card__score"><Star size={11} fill="currentColor" /> {score}</span>
        )}
        <span className="anime-card__play" aria-hidden="true"><Play size={19} fill="currentColor" /></span>
      </span>
      <span className="anime-card__content">
        <strong>{title}</strong>
        <span className="anime-card__meta">
          <span>{source === "otakudesu" ? "Otakudesu" : "Samehadaku"}</span>
          {status && <span>{status}</span>}
          {subText && <span>{subText}</span>}
        </span>
      </span>
    </Link>
  );
}
