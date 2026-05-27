"use client";

import { useEffect } from "react";

type WatchRecorderProps = {
  source: "samehadaku" | "otakudesu";
  animeSlug: string;
  animeTitle: string;
  episodeSlug: string;
  episodeTitle: string;
  posterUrl?: string;
  animePath: string;
  episodePath: string;
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
  } = props;

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/watch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source,
        animeSlug,
        animeTitle,
        episodeSlug,
        episodeTitle,
        posterUrl,
        animePath,
        episodePath,
      }),
      signal: controller.signal,
    }).catch(() => {
      // Anonymous users and missing databases should not interrupt streaming.
    });

    return () => controller.abort();
  }, [source, animeSlug, animeTitle, episodeSlug, episodeTitle, posterUrl, animePath, episodePath]);

  return null;
}
