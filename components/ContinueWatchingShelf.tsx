"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Clock3, Play } from "lucide-react";
import { useEffect, useState } from "react";

type HistoryItem = {
  anime_title: string;
  episode_title: string;
  poster_url: string | null;
  episode_path: string;
};

export default function ContinueWatchingShelf() {
  const [history, setHistory] = useState<HistoryItem | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    fetch("/api/watch", { cache: "no-store" })
      .then((response) => response.json())
      .then((json) => active && setHistory(json.history ?? null))
      .catch(() => active && setHistory(null));
    return () => { active = false; };
  }, []);

  if (history === undefined) {
    return <div className="continue-shelf continue-shelf--loading" aria-label="Memuat riwayat tontonan" />;
  }

  return (
    <section className="continue-shelf" aria-labelledby="continue-title">
      <div className="shelf-heading">
        <div><Clock3 size={18} /><h2 id="continue-title">Lanjutkan Menonton</h2></div>
        <Link href="/history" prefetch={false}>Lihat Semua <ChevronRight size={15} /></Link>
      </div>
      {history ? (
        <Link href={history.episode_path} prefetch={false} className="continue-card">
          <span className="continue-card__media">
            {history.poster_url ? <Image src={history.poster_url} alt={history.anime_title} fill sizes="320px" className="object-cover" /> : <span />}
            <span className="continue-card__shade" />
            <span className="continue-card__play"><Play size={18} fill="currentColor" /></span>
          </span>
          <span className="continue-card__copy">
            <strong>{history.anime_title}</strong>
            <span>{history.episode_title}</span>
            <span className="continue-card__progress"><i /></span>
          </span>
        </Link>
      ) : (
        <div className="continue-empty">
          <div><strong>Riwayat tontonanmu akan muncul di sini.</strong><span>Masuk dan buka satu episode untuk melanjutkan dengan cepat.</span></div>
          <Link href="/login?next=/" prefetch={false}>Masuk</Link>
        </div>
      )}
    </section>
  );
}
