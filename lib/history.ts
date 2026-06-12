export type WatchHistoryItem = {
  source: string;
  anime_slug: string;
  anime_title: string;
  episode_slug: string;
  episode_title: string;
  poster_url: string | null;
  anime_path: string;
  episode_path: string;
  watched_at: string;
  watched_seconds: number | null;
  duration_seconds: number | null;
  progress_percent: number | null;
  progress_source: "player" | null;
  is_completed: boolean;
  last_watched_at: string | null;
};

type AnimeHistoryKey = {
  source: string;
  anime_slug: string;
  watched_at: string | Date;
};

export type HistorySource = "all" | "samehadaku" | "otakudesu";

export function normalizeHistorySource(value: unknown): HistorySource {
  return value === "samehadaku" || value === "otakudesu" ? value : "all";
}

export function historyAnimeKey(item: Pick<AnimeHistoryKey, "source" | "anime_slug">) {
  return `${item.source}:${item.anime_slug}`;
}

export function groupLatestByAnime<T extends AnimeHistoryKey>(rows: T[]) {
  const sorted = [...rows].sort((a, b) => {
    return new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime();
  });
  const seen = new Set<string>();
  const latest: T[] = [];

  for (const row of sorted) {
    const key = historyAnimeKey(row);
    if (seen.has(key)) continue;
    seen.add(key);
    latest.push(row);
  }

  return latest;
}
