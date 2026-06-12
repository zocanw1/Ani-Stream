import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  groupLatestByAnime,
  historyAnimeKey,
  normalizeHistorySource,
} from "../lib/history";
import { normalizePlayerProgress } from "../lib/player-progress";
import { normalizeWatchPayload } from "../lib/watch-history";

test("groups history by anime using newest watched item", () => {
  const rows = [
    { source: "samehadaku", anime_slug: "a", episode_slug: "a-2", watched_at: "2026-05-27T03:00:00.000Z" },
    { source: "samehadaku", anime_slug: "b", episode_slug: "b-1", watched_at: "2026-05-27T02:00:00.000Z" },
    { source: "samehadaku", anime_slug: "a", episode_slug: "a-1", watched_at: "2026-05-27T01:00:00.000Z" },
  ];

  assert.deepEqual(groupLatestByAnime(rows).map((row) => row.episode_slug), ["a-2", "b-1"]);
});

test("history source normalization keeps providers separate", () => {
  assert.equal(normalizeHistorySource("samehadaku"), "samehadaku");
  assert.equal(normalizeHistorySource("otakudesu"), "otakudesu");
  assert.equal(normalizeHistorySource("invalid"), "all");
  assert.notEqual(
    historyAnimeKey({ source: "samehadaku", anime_slug: "one-piece" }),
    historyAnimeKey({ source: "otakudesu", anime_slug: "one-piece" }),
  );
});

test("player progress only accepts real numeric player positions", () => {
  assert.deepEqual(normalizePlayerProgress({ currentTime: 120, duration: 600 }), {
    watchedSeconds: 120,
    durationSeconds: 600,
    progressPercent: 20,
    progressSource: "player",
    isCompleted: false,
  });
  assert.deepEqual(
    normalizePlayerProgress({ data: { position: 300, duration: 600, ended: true } }),
    {
      watchedSeconds: 300,
      durationSeconds: 600,
      progressPercent: 50,
      progressSource: "player",
      isCompleted: true,
    },
  );
  assert.equal(normalizePlayerProgress({ currentTime: "-1", duration: 600 }), null);
  assert.equal(normalizePlayerProgress({ currentTime: -1, duration: 600 }), null);
  assert.equal(normalizePlayerProgress({ duration: 600 }), null);
});

test("watch payload stores valid player progress without requiring it", () => {
  const metadataOnly = normalizeWatchPayload({
    source: "samehadaku",
    animeSlug: "one-piece",
    animeTitle: "One Piece",
    episodeSlug: "one-piece-1",
    episodeTitle: "Episode 1",
    animePath: "/anime/one-piece",
    episodePath: "/anime/episode/one-piece-1",
  });
  assert.equal(metadataOnly.progress, null);

  const withProgress = normalizeWatchPayload({
    source: "samehadaku",
    animeSlug: "one-piece",
    animeTitle: "One Piece",
    episodeSlug: "one-piece-1",
    episodeTitle: "Episode 1",
    animePath: "/anime/one-piece",
    episodePath: "/anime/episode/one-piece-1",
    progress: {
      watchedSeconds: 90,
      durationSeconds: 600,
      progressPercent: 15,
      progressSource: "player",
      isCompleted: false,
      recordedAt: "2026-06-12T12:00:00.000Z",
    },
  });
  assert.deepEqual(withProgress.progress, {
    watchedSeconds: 90,
    durationSeconds: 600,
    progressPercent: 15,
    progressSource: "player",
    isCompleted: false,
    recordedAt: "2026-06-12T12:00:00.000Z",
  });
});

test("history schema supports nullable real player progress", () => {
  const schema = readFileSync("database/schema.sql", "utf8");
  const db = readFileSync("lib/db.ts", "utf8");

  for (const source of [schema, db]) {
    assert.match(source, /watched_seconds DOUBLE PRECISION/i);
    assert.match(source, /duration_seconds DOUBLE PRECISION/i);
    assert.match(source, /progress_percent DOUBLE PRECISION/i);
    assert.match(source, /progress_source TEXT/i);
    assert.match(source, /is_completed BOOLEAN NOT NULL DEFAULT FALSE/i);
    assert.match(source, /last_watched_at TIMESTAMPTZ/i);
  }
  assert.match(db, /ADD COLUMN IF NOT EXISTS watched_seconds/i);
});

test("opening a different episode clears stale latest-progress fields", () => {
  const history = readFileSync("lib/watch-history.ts", "utf8");

  assert.match(
    history,
    /EXCLUDED\.episode_path\s*<>\s*watch_history\.episode_path/,
  );
});
