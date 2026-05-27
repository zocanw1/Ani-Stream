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

export async function recordWatchHistory(userId: string, body: WatchHistoryPayload | null) {
  const payload = normalizeWatchPayload(body);
  if (!isValidWatchPayload(payload)) {
    return { ok: false as const, error: "Data tontonan tidak lengkap." };
  }

  await ensureDatabase();
  const sql = getSql();

  await sql`
    INSERT INTO watch_history_events (
      user_id, source, anime_slug, anime_title, episode_slug, episode_title,
      poster_url, anime_path, episode_path, watched_at
    )
    VALUES (
      ${userId}, ${payload.source}, ${payload.animeSlug}, ${payload.animeTitle}, ${payload.episodeSlug}, ${payload.episodeTitle},
      ${payload.posterUrl || null}, ${payload.animePath}, ${payload.episodePath}, NOW()
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
      ${payload.posterUrl || null}, ${payload.animePath}, ${payload.episodePath}, NOW()
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
  if (event) return event;

  const legacyRows = await getSql()`
    SELECT source, anime_slug, anime_title, episode_slug, episode_title,
           poster_url, anime_path, episode_path, updated_at AS watched_at
    FROM watch_history
    WHERE user_id = ${userId}
    LIMIT 1
  `;

  return (legacyRows as unknown as WatchHistoryItem[])[0] ?? null;
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

  return rows as unknown as WatchHistoryItem[];
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

  return rows as unknown as WatchHistoryItem[];
}
