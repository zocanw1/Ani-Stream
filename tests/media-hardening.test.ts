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

test("the unfinished favorite control is not rendered", () => {
  const home = read("components/pages/HomePageClient.tsx");
  assert.doesNotMatch(home, /\+ Favorite/);
});
