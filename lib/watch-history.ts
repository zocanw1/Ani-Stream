import { ensureDatabase, getSql, hasDatabaseUrl } from "./db";
import type { WatchHistoryItem } from "./history";

export type WatchHistoryPayload = {
  source?: string;
  animeSlug?: string;
  animeTitle?: string;
  episodeSlug?: string;
  episodeTitle?: string;
  posterUrl?: string;
  animePath?: string;
  episodePath?: string;
};

export function cleanWatchText(value: unknown, maxLength = 500) {
  return String(value || "").trim().slice(0, maxLength);
}

export function normalizeWatchPayload(body: WatchHistoryPayload | null) {
  return {
    source: cleanWatchText(body?.source, 30),
    animeSlug: cleanWatchText(body?.animeSlug, 200),
    animeTitle: cleanWatchText(body?.animeTitle),
    episodeSlug: cleanWatchText(body?.episodeSlug, 200),
    episodeTitle: cleanWatchText(body?.episodeTitle),
    posterUrl: cleanWatchText(body?.posterUrl, 1000),
    animePath: cleanWatchText(body?.animePath, 400),
    episodePath: cleanWatchText(body?.episodePath, 400),
  };
}

export function isValidWatchPayload(payload: ReturnType<typeof normalizeWatchPayload>) {
  return Boolean(
    payload.source &&
      payload.animeSlug &&
      payload.animeTitle &&
      payload.episodeSlug &&
      payload.episodeTitle &&
      payload.animePath &&
      payload.episodePath
  );
}

type AnimeSearchResult = {
  title?: string;
  animeId?: string;
  poster?: string;
  href?: string;
};

function cleanOtakudesuAnimeSlug(href: string) {
  return href.replace(/^\/anime\/anime\//, "").replace(/^\/anime\//, "");
}

function cleanSamehadakuAnimeSlug(href: string) {
  return href.replace(/^\/samehadaku\/anime\//, "").replace(/^\/anime\//, "");
}

function normalizeSource(value: string) {
  return value.toLowerCase().includes("otakudesu") ? "otakudesu" : "samehadaku";
}

function toInternalAnimePath(source: string, result: AnimeSearchResult) {
  if (!result.href && !result.animeId) return "";
  if (normalizeSource(source) === "otakudesu") {
    return `/otakudesu/anime/${cleanOtakudesuAnimeSlug(result.href || result.animeId || "")}`;
  }
  return `/anime/${cleanSamehadakuAnimeSlug(result.href || result.animeId || "")}`;
}

async function findAnimeByTitle(source: string, animeTitle: string) {
  const title = cleanWatchText(animeTitle, 120);
  if (!title) return null;

  const url =
    normalizeSource(source) === "otakudesu"
      ? `https://www.sankavollerei.com/anime/search/${encodeURIComponent(title)}`
      : `https://www.sankavollerei.com/anime/samehadaku/search?q=${encodeURIComponent(title)}`;

  const response = await fetch(url, { next: { revalidate: 86400 } }).catch(() => null);
  if (!response?.ok) return null;

  const json = await response.json().catch(() => null);
  const animeList = (json?.data?.animeList || []) as AnimeSearchResult[];
  return animeList.find((anime) => anime.poster) ?? null;
}

async function completeHistoryItemPoster<T extends WatchHistoryItem>(item: T): Promise<T> {
  if (item.poster_url) return item;

  const result = await findAnimeByTitle(item.source, item.anime_title);
  if (!result?.poster) return item;

  return {
    ...item,
    poster_url: result.poster,
    anime_path: toInternalAnimePath(item.source, result) || item.anime_path,
  };
}

async function completeHistoryPosters<T extends WatchHistoryItem>(items: T[]) {
  return Promise.all(items.map((item) => completeHistoryItemPoster(item)));
}

export async function recordWatchHistory(userId: string, body: WatchHistoryPayload | null) {
  const payload = normalizeWatchPayload(body);
  if (!isValidWatchPayload(payload)) {
    return { ok: false as const, error: "Data tontonan tidak lengkap." };
  }

  const animeSnapshot = payload.posterUrl ? null : await findAnimeByTitle(payload.source, payload.animeTitle);
  const posterUrl = payload.posterUrl || animeSnapshot?.poster || "";
  const animePath = animeSnapshot ? toInternalAnimePath(payload.source, animeSnapshot) || payload.animePath : payload.animePath;

  await ensureDatabase();
  const sql = getSql();

  await sql`
    INSERT INTO watch_history_events (
      user_id, source, anime_slug, anime_title, episode_slug, episode_title,
      poster_url, anime_path, episode_path, watched_at
    )
    VALUES (
      ${userId}, ${payload.source}, ${payload.animeSlug}, ${payload.animeTitle}, ${payload.episodeSlug}, ${payload.episodeTitle},
      ${posterUrl || null}, ${animePath}, ${payload.episodePath}, NOW()
    )
    ON CONFLICT (user_id, episode_path) DO UPDATE SET
      source = EXCLUDED.source,
      anime_slug = EXCLUDED.anime_slug,
      anime_title = EXCLUDED.anime_title,
      episode_slug = EXCLUDED.episode_slug,
      episode_title = EXCLUDED.episode_title,
      poster_url = EXCLUDED.poster_url,
      anime_path = EXCLUDED.anime_path,
      watched_at = NOW()
  `;

  await sql`
    INSERT INTO watch_history (
      user_id, source, anime_slug, anime_title, episode_slug, episode_title,
      poster_url, anime_path, episode_path, updated_at
    )
    VALUES (
      ${userId}, ${payload.source}, ${payload.animeSlug}, ${payload.animeTitle}, ${payload.episodeSlug}, ${payload.episodeTitle},
      ${posterUrl || null}, ${animePath}, ${payload.episodePath}, NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      source = EXCLUDED.source,
      anime_slug = EXCLUDED.anime_slug,
      anime_title = EXCLUDED.anime_title,
      episode_slug = EXCLUDED.episode_slug,
      episode_title = EXCLUDED.episode_title,
      poster_url = EXCLUDED.poster_url,
      anime_path = EXCLUDED.anime_path,
      episode_path = EXCLUDED.episode_path,
      updated_at = NOW()
  `;

  return { ok: true as const };
}

export async function getLastWatchHistory(userId: string) {
  if (!hasDatabaseUrl()) return null;
  await ensureDatabase();

  const eventRows = await getSql()`
    SELECT source, anime_slug, anime_title, episode_slug, episode_title,
           poster_url, anime_path, episode_path, watched_at
    FROM watch_history_events
    WHERE user_id = ${userId}
    ORDER BY watched_at DESC
    LIMIT 1
  `;

  const event = (eventRows as unknown as WatchHistoryItem[])[0];
  if (event) return completeHistoryItemPoster(event);

  const legacyRows = await getSql()`
    SELECT source, anime_slug, anime_title, episode_slug, episode_title,
           poster_url, anime_path, episode_path, updated_at AS watched_at
    FROM watch_history
    WHERE user_id = ${userId}
    LIMIT 1
  `;

  const legacy = (legacyRows as unknown as WatchHistoryItem[])[0];
  return legacy ? completeHistoryItemPoster(legacy) : null;
}

export async function getEpisodeHistory(userId: string, limit = 100) {
  await ensureDatabase();
  const rows = await getSql()`
    SELECT source, anime_slug, anime_title, episode_slug, episode_title,
           poster_url, anime_path, episode_path, watched_at
    FROM watch_history_events
    WHERE user_id = ${userId}
    ORDER BY watched_at DESC
    LIMIT ${limit}
  `;

  return completeHistoryPosters(rows as unknown as WatchHistoryItem[]);
}

export async function getAnimeHistory(userId: string, limit = 100) {
  await ensureDatabase();
  const rows = await getSql()`
    SELECT *
    FROM (
      SELECT DISTINCT ON (anime_slug)
        source, anime_slug, anime_title, episode_slug, episode_title,
        poster_url, anime_path, episode_path, watched_at
      FROM watch_history_events
      WHERE user_id = ${userId}
      ORDER BY anime_slug, watched_at DESC
    ) latest
    ORDER BY watched_at DESC
    LIMIT ${limit}
  `;

  return completeHistoryPosters(rows as unknown as WatchHistoryItem[]);
}
