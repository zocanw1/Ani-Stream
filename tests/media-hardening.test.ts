import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path: string) {
  return readFileSync(path, "utf8");
}

test("streaming frames remain compatible with providers and use a strict referrer policy", () => {
  const player = read("components/MobileFullscreenPlayer.tsx");

  assert.doesNotMatch(player, /sandbox=/);
  assert.match(player, /referrerPolicy="strict-origin-when-cross-origin"/);

  for (const path of [
    "app/anime/episode/[slug]/EpisodeDetailClient.tsx",
    "app/otakudesu/episode/[slug]/OtakudesuEpisodeClient.tsx",
  ]) {
    const source = read(path);
    assert.match(source, /MobileFullscreenPlayer/);
  }
});

test("real iframe progress is validated and never estimated from page time", () => {
  const player = read("components/MobileFullscreenPlayer.tsx");
  const recorder = read("components/WatchRecorder.tsx");

  assert.match(player, /iframeRef\.current\?\.contentWindow\s*!==\s*event\.source/);
  assert.match(player, /event\.origin\s*!==\s*playerOrigin/);
  assert.match(player, /normalizePlayerProgress\(event\.data\)/);
  assert.match(player, /PLAYER_PROGRESS_EVENT/);
  assert.match(recorder, /PLAYER_PROGRESS_EVENT/);
  assert.match(recorder, /sendBeacon/);
  assert.doesNotMatch(recorder, /setInterval|performance\.now|Date\.now\(\)\s*-/);
});

test("the unfinished favorite control is not rendered", () => {
  const home = read("components/pages/HomePageClient.tsx");
  assert.doesNotMatch(home, /\+ Favorite/);
});
