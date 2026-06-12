import { ensureDatabase, getSql, hasDatabaseUrl } from "./db";
import { normalizeHistorySource, type HistorySource, type WatchHistoryItem } from "./history";
import type { PlayerProgress } from "./player-progress";

export type StoredWatchProgress = PlayerProgress & {
  recordedAt: string;
};

export type WatchHistoryPayload = {
  source?: string;
  animeSlug?: string;
  animeTitle?: string;
  episodeSlug?: string;
  episodeTitle?: string;
  posterUrl?: string;
  animePath?: string;
  episodePath?: string;
  progress?: Partial<StoredWatchProgress> | null;
};

export function cleanWatchText(value: unknown, maxLength = 500) {
  return String(value || "").trim().slice(0, maxLength);
}

export function normalizeWatchPayload(body: WatchHistoryPayload | null) {
  const source = normalizeHistorySource(cleanWatchText(body?.source, 30));

  return {
    source: source === "all" ? "" : source,
    animeSlug: cleanWatchText(body?.animeSlug, 200),
    animeTitle: cleanWatchText(body?.animeTitle),
    episodeSlug: cleanWatchText(body?.episodeSlug, 200),
    episodeTitle: cleanWatchText(body?.episodeTitle),
    posterUrl: cleanWatchText(body?.posterUrl, 1000),
    animePath: cleanWatchText(body?.animePath, 400),
    episodePath: cleanWatchText(body?.episodePath, 400),
    progress: normalizeStoredProgress(body?.progress),
  };
}

function normalizeStoredProgress(value: WatchHistoryPayload["progress"]): StoredWatchProgress | null {
  if (!value || value.progressSource !== "player") return null;

  const watchedSeconds = value.watchedSeconds;
  const durationSeconds = value.durationSeconds;
  const progressPercent = value.progressPercent;
  const recordedAt = new Date(String(value.recordedAt || ""));

  if (
    typeof watchedSeconds !== "number" ||
    !Number.isFinite(watchedSeconds) ||
    watchedSeconds < 0 ||
    (durationSeconds !== null &&
      (typeof durationSeconds !== "number" || !Number.isFinite(durationSeconds) || durationSeconds <= 0)) ||
    (progressPercent !== null &&
      (typeof progressPercent !== "number" ||
        !Number.isFinite(progressPercent) ||
        progressPercent < 0 ||
        progressPercent > 100)) ||
    Number.isNaN(recordedAt.getTime())
  ) {
    return null;
  }

  return {
    watchedSeconds,
    durationSeconds: durationSeconds ?? null,
    progressPercent: progressPercent ?? null,
    progressSource: "player",
    isCompleted: value.isCompleted === true,
    recordedAt: recordedAt.toISOString(),
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
  const progress = payload.progress;

  await ensureDatabase();
  const sql = getSql();

  await sql`
    INSERT INTO watch_history_events (
      user_id, source, anime_slug, anime_title, episode_slug, episode_title,
      poster_url, anime_path, episode_path, watched_seconds, duration_seconds,
      progress_percent, progress_source, is_completed, last_watched_at, watched_at
    )
    VALUES (
      ${userId}, ${payload.source}, ${payload.animeSlug}, ${payload.animeTitle}, ${payload.episodeSlug}, ${payload.episodeTitle},
      ${posterUrl || null}, ${animePath}, ${payload.episodePath}, ${progress?.watchedSeconds ?? null},
      ${progress?.durationSeconds ?? null}, ${progress?.progressPercent ?? null}, ${progress?.progressSource ?? null},
      ${progress?.isCompleted ?? false}, ${progress?.recordedAt ?? null}, NOW()
    )
    ON CONFLICT (user_id, episode_path) DO UPDATE SET
      source = EXCLUDED.source,
      anime_slug = EXCLUDED.anime_slug,
      anime_title = EXCLUDED.anime_title,
      episode_slug = EXCLUDED.episode_slug,
      episode_title = EXCLUDED.episode_title,
      poster_url = EXCLUDED.poster_url,
      anime_path = EXCLUDED.anime_path,
      watched_seconds = CASE
        WHEN EXCLUDED.progress_source = 'player'
          AND (watch_history_events.last_watched_at IS NULL OR EXCLUDED.last_watched_at >= watch_history_events.last_watched_at)
        THEN EXCLUDED.watched_seconds
        ELSE watch_history_events.watched_seconds
      END,
      duration_seconds = CASE
        WHEN EXCLUDED.progress_source = 'player'
          AND (watch_history_events.last_watched_at IS NULL OR EXCLUDED.last_watched_at >= watch_history_events.last_watched_at)
        THEN EXCLUDED.duration_seconds
        ELSE watch_history_events.duration_seconds
      END,
      progress_percent = CASE
        WHEN EXCLUDED.progress_source = 'player'
          AND (watch_history_events.last_watched_at IS NULL OR EXCLUDED.last_watched_at >= watch_history_events.last_watched_at)
        THEN EXCLUDED.progress_percent
        ELSE watch_history_events.progress_percent
      END,
      progress_source = CASE
        WHEN EXCLUDED.progress_source = 'player'
          AND (watch_history_events.last_watched_at IS NULL OR EXCLUDED.last_watched_at >= watch_history_events.last_watched_at)
        THEN EXCLUDED.progress_source
        ELSE watch_history_events.progress_source
      END,
      is_completed = watch_history_events.is_completed OR EXCLUDED.is_completed,
      last_watched_at = CASE
        WHEN EXCLUDED.progress_source = 'player'
          AND (watch_history_events.last_watched_at IS NULL OR EXCLUDED.last_watched_at >= watch_history_events.last_watched_at)
        THEN EXCLUDED.last_watched_at
        ELSE watch_history_events.last_watched_at
      END,
      watched_at = NOW()
  `;

  await sql`
    INSERT INTO watch_history (
      user_id, source, anime_slug, anime_title, episode_slug, episode_title,
      poster_url, anime_path, episode_path, watched_seconds, duration_seconds,
      progress_percent, progress_source, is_completed, last_watched_at, updated_at
    )
    VALUES (
      ${userId}, ${payload.source}, ${payload.animeSlug}, ${payload.animeTitle}, ${payload.episodeSlug}, ${payload.episodeTitle},
      ${posterUrl || null}, ${animePath}, ${payload.episodePath}, ${progress?.watchedSeconds ?? null},
      ${progress?.durationSeconds ?? null}, ${progress?.progressPercent ?? null}, ${progress?.progressSource ?? null},
      ${progress?.isCompleted ?? false}, ${progress?.recordedAt ?? null}, NOW()
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
      watched_seconds = CASE
        WHEN EXCLUDED.episode_path <> watch_history.episode_path
        THEN EXCLUDED.watched_seconds
        WHEN EXCLUDED.progress_source = 'player'
          AND (watch_history.last_watched_at IS NULL OR EXCLUDED.last_watched_at >= watch_history.last_watched_at)
        THEN EXCLUDED.watched_seconds
        ELSE watch_history.watched_seconds
      END,
      duration_seconds = CASE
        WHEN EXCLUDED.episode_path <> watch_history.episode_path
        THEN EXCLUDED.duration_seconds
        WHEN EXCLUDED.progress_source = 'player'
          AND (watch_history.last_watched_at IS NULL OR EXCLUDED.last_watched_at >= watch_history.last_watched_at)
        THEN EXCLUDED.duration_seconds
        ELSE watch_history.duration_seconds
      END,
      progress_percent = CASE
        WHEN EXCLUDED.episode_path <> watch_history.episode_path
        THEN EXCLUDED.progress_percent
        WHEN EXCLUDED.progress_source = 'player'
          AND (watch_history.last_watched_at IS NULL OR EXCLUDED.last_watched_at >= watch_history.last_watched_at)
        THEN EXCLUDED.progress_percent
        ELSE watch_history.progress_percent
      END,
      progress_source = CASE
        WHEN EXCLUDED.episode_path <> watch_history.episode_path
        THEN EXCLUDED.progress_source
        WHEN EXCLUDED.progress_source = 'player'
          AND (watch_history.last_watched_at IS NULL OR EXCLUDED.last_watched_at >= watch_history.last_watched_at)
        THEN EXCLUDED.progress_source
        ELSE watch_history.progress_source
      END,
      is_completed = CASE
        WHEN EXCLUDED.episode_path <> watch_history.episode_path
        THEN EXCLUDED.is_completed
        ELSE watch_history.is_completed OR EXCLUDED.is_completed
      END,
      last_watched_at = CASE
        WHEN EXCLUDED.episode_path <> watch_history.episode_path
        THEN EXCLUDED.last_watched_at
        WHEN EXCLUDED.progress_source = 'player'
          AND (watch_history.last_watched_at IS NULL OR EXCLUDED.last_watched_at >= watch_history.last_watched_at)
        THEN EXCLUDED.last_watched_at
        ELSE watch_history.last_watched_at
      END,
      updated_at = NOW()
  `;

  return { ok: true as const };
}

export async function getLastWatchHistory(userId: string, source: HistorySource = "all") {
  if (!hasDatabaseUrl()) return null;
  await ensureDatabase();
  const normalizedSource = normalizeHistorySource(source);

  const eventRows =
    normalizedSource === "all"
      ? await getSql()`
          SELECT source, anime_slug, anime_title, episode_slug, episode_title,
                 poster_url, anime_path, episode_path, watched_at, watched_seconds,
                 duration_seconds, progress_percent, progress_source, is_completed, last_watched_at
          FROM watch_history_events
          WHERE user_id = ${userId}
          ORDER BY watched_at DESC
          LIMIT 1
        `
      : await getSql()`
          SELECT source, anime_slug, anime_title, episode_slug, episode_title,
                 poster_url, anime_path, episode_path, watched_at, watched_seconds,
                 duration_seconds, progress_percent, progress_source, is_completed, last_watched_at
          FROM watch_history_events
          WHERE user_id = ${userId} AND source = ${normalizedSource}
          ORDER BY watched_at DESC
          LIMIT 1
        `;

  const event = (eventRows as unknown as WatchHistoryItem[])[0];
  if (event) return completeHistoryItemPoster(event);

  const legacyRows = await getSql()`
    SELECT source, anime_slug, anime_title, episode_slug, episode_title,
           poster_url, anime_path, episode_path, updated_at AS watched_at,
           watched_seconds, duration_seconds, progress_percent, progress_source,
           is_completed, last_watched_at
    FROM watch_history
    WHERE user_id = ${userId}
      AND (${normalizedSource} = 'all' OR source = ${normalizedSource})
    LIMIT 1
  `;

  const legacy = (legacyRows as unknown as WatchHistoryItem[])[0];
  return legacy ? completeHistoryItemPoster(legacy) : null;
}

export async function getEpisodeHistory(userId: string, limit = 100, source: HistorySource = "all") {
  await ensureDatabase();
  const normalizedSource = normalizeHistorySource(source);
  const rows =
    normalizedSource === "all"
      ? await getSql()`
          SELECT source, anime_slug, anime_title, episode_slug, episode_title,
                 poster_url, anime_path, episode_path, watched_at, watched_seconds,
                 duration_seconds, progress_percent, progress_source, is_completed, last_watched_at
          FROM watch_history_events
          WHERE user_id = ${userId}
          ORDER BY watched_at DESC
          LIMIT ${limit}
        `
      : await getSql()`
          SELECT source, anime_slug, anime_title, episode_slug, episode_title,
                 poster_url, anime_path, episode_path, watched_at, watched_seconds,
                 duration_seconds, progress_percent, progress_source, is_completed, last_watched_at
          FROM watch_history_events
          WHERE user_id = ${userId} AND source = ${normalizedSource}
          ORDER BY watched_at DESC
          LIMIT ${limit}
        `;

  return completeHistoryPosters(rows as unknown as WatchHistoryItem[]);
}

export async function getAnimeHistory(userId: string, limit = 100, source: HistorySource = "all") {
  await ensureDatabase();
  const normalizedSource = normalizeHistorySource(source);
  const rows =
    normalizedSource === "all"
      ? await getSql()`
          SELECT *
          FROM (
            SELECT DISTINCT ON (source, anime_slug)
              source, anime_slug, anime_title, episode_slug, episode_title,
              poster_url, anime_path, episode_path, watched_at, watched_seconds,
              duration_seconds, progress_percent, progress_source, is_completed, last_watched_at
            FROM watch_history_events
            WHERE user_id = ${userId}
            ORDER BY source, anime_slug, watched_at DESC
          ) latest
          ORDER BY watched_at DESC
          LIMIT ${limit}
        `
      : await getSql()`
          SELECT *
          FROM (
            SELECT DISTINCT ON (source, anime_slug)
              source, anime_slug, anime_title, episode_slug, episode_title,
              poster_url, anime_path, episode_path, watched_at, watched_seconds,
              duration_seconds, progress_percent, progress_source, is_completed, last_watched_at
            FROM watch_history_events
            WHERE user_id = ${userId} AND source = ${normalizedSource}
            ORDER BY source, anime_slug, watched_at DESC
          ) latest
          ORDER BY watched_at DESC
          LIMIT ${limit}
        `;

  return completeHistoryPosters(rows as unknown as WatchHistoryItem[]);
}
