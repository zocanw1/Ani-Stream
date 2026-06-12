import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path: string) {
  return readFileSync(path, "utf8");
}

test("episode pages use the controlled fullscreen player", () => {
  for (const path of [
    "app/anime/episode/[slug]/EpisodeDetailClient.tsx",
    "app/otakudesu/episode/[slug]/OtakudesuEpisodeClient.tsx",
  ]) {
    const page = read(path);

    assert.match(page, /MobileFullscreenPlayer/);
    assert.doesNotMatch(page, /allowFullScreen/);
  }
});

test("controlled player locks landscape and owns fullscreen exit", () => {
  const player = read("components/MobileFullscreenPlayer.tsx");

  assert.match(player, /orientation\.lock\("landscape"\)/);
  assert.match(player, /requestFullscreen/);
  assert.match(player, /exitFullscreen/);
  assert.match(player, /onDoubleClick/);
  assert.match(player, /Keluar dari layar penuh/);
  assert.doesNotMatch(player, /allowFullScreen/);
  assert.doesNotMatch(player, /fullscreen; picture-in-picture/);
});

test("portrait phones rotate the controlled fullscreen surface", () => {
  const css = read("app/globals.css");

  assert.match(css, /\.mobile-video-player:fullscreen/);
  assert.match(css, /\.mobile-video-player--fallback/);
  assert.match(css, /orientation:\s*portrait/);
  assert.match(css, /rotate\(90deg\)/);
});
