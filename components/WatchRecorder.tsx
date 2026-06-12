"use client";

import { useEffect } from "react";
import {
  PLAYER_PROGRESS_EVENT,
  type PlayerProgressEventDetail,
} from "@/lib/player-progress";
import type { StoredWatchProgress } from "@/lib/watch-history";

type WatchRecorderProps = {
  source: "samehadaku" | "otakudesu";
  animeSlug: string;
  animeTitle: string;
  episodeSlug: string;
  episodeTitle: string;
  posterUrl?: string;
  animePath: string;
  episodePath: string;
  playerSrc: string;
};

export default function WatchRecorder(props: WatchRecorderProps) {
  const {
    source,
    animeSlug,
    animeTitle,
    episodeSlug,
    episodeTitle,
    posterUrl,
    animePath,
    episodePath,
    playerSrc,
  } = props;

  useEffect(() => {
    const metadata = {
      source,
      animeSlug,
      animeTitle,
      episodeSlug,
      episodeTitle,
      posterUrl,
      animePath,
      episodePath,
    };
    let latestProgress: StoredWatchProgress | null = null;
    let lastSentAt = 0;

    const send = (progress: StoredWatchProgress | null = null) =>
      fetch("/api/watch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...metadata, progress }),
        keepalive: true,
      }).catch(() => {
        // History failures must never interrupt streaming.
      });

    const flushWithBeacon = () => {
      if (!latestProgress) return;
      const body = new Blob([JSON.stringify({ ...metadata, progress: latestProgress })], {
        type: "application/json",
      });
      if (
        typeof navigator.sendBeacon !== "function" ||
        !navigator.sendBeacon("/api/watch", body)
      ) {
        void send(latestProgress);
      }
      latestProgress = null;
    };

    const handleProgress = (event: Event) => {
      const detail = (event as CustomEvent<PlayerProgressEventDetail>).detail;
      if (!detail || detail.src !== playerSrc) return;

      latestProgress = {
        ...detail.progress,
        recordedAt: new Date().toISOString(),
      };

      const now = Date.now();
      if (detail.progress.isCompleted || now - lastSentAt >= 15_000) {
        lastSentAt = now;
        const progress = latestProgress;
        latestProgress = null;
        void send(progress);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") flushWithBeacon();
    };

    void send();

    window.addEventListener(PLAYER_PROGRESS_EVENT, handleProgress);
    window.addEventListener("pagehide", flushWithBeacon);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      flushWithBeacon();
      window.removeEventListener(PLAYER_PROGRESS_EVENT, handleProgress);
      window.removeEventListener("pagehide", flushWithBeacon);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    source,
    animeSlug,
    animeTitle,
    episodeSlug,
    episodeTitle,
    posterUrl,
    animePath,
    episodePath,
    playerSrc,
  ]);

  return null;
}
