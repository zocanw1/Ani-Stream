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
};

type AnimeHistoryKey = {
  anime_slug: string;
  watched_at: string | Date;
};

export function groupLatestByAnime<T extends AnimeHistoryKey>(rows: T[]) {
  const sorted = [...rows].sort((a, b) => {
    return new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime();
  });
  const seen = new Set<string>();
  const latest: T[] = [];

  for (const row of sorted) {
    if (seen.has(row.anime_slug)) continue;
    seen.add(row.anime_slug);
    latest.push(row);
  }

  return latest;
}
