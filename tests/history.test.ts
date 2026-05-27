import assert from "node:assert/strict";
import test from "node:test";
import { groupLatestByAnime } from "../lib/history";

test("groups history by anime using newest watched item", () => {
  const rows = [
    { anime_slug: "a", episode_slug: "a-2", watched_at: "2026-05-27T03:00:00.000Z" },
    { anime_slug: "b", episode_slug: "b-1", watched_at: "2026-05-27T02:00:00.000Z" },
    { anime_slug: "a", episode_slug: "a-1", watched_at: "2026-05-27T01:00:00.000Z" },
  ];

  assert.deepEqual(groupLatestByAnime(rows).map((row) => row.episode_slug), ["a-2", "b-1"]);
});
