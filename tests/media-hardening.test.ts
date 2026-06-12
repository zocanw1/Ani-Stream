import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path: string) {
  return readFileSync(path, "utf8");
}

test("streaming frames use a sandbox and strict referrer policy", () => {
  for (const path of [
    "app/anime/episode/[slug]/EpisodeDetailClient.tsx",
    "app/otakudesu/episode/[slug]/OtakudesuEpisodeClient.tsx",
  ]) {
    const source = read(path);
    assert.match(source, /sandbox=/);
    assert.match(source, /referrerPolicy="strict-origin-when-cross-origin"/);
  }
});

test("the unfinished favorite control is not rendered", () => {
  const home = read("components/pages/HomePageClient.tsx");
  assert.doesNotMatch(home, /\+ Favorite/);
});
