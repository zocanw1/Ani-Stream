import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const episodeClients = [
  "app/anime/episode/[slug]/EpisodeDetailClient.tsx",
  "app/otakudesu/episode/[slug]/OtakudesuEpisodeClient.tsx",
];

function read(path: string) {
  return readFileSync(path, "utf8");
}

test("server buttons only become active after the player URL changes successfully", () => {
  for (const path of episodeClients) {
    const source = read(path);
    const updateUrl = source.indexOf("setStreamingUrl(nextUrl)");
    const updateActiveServer = source.indexOf("setActiveServer(serverId)");

    assert.ok(updateUrl >= 0, `${path} must update the player with a validated URL`);
    assert.ok(
      updateActiveServer > updateUrl,
      `${path} must not highlight a server before its URL is applied`,
    );
    assert.match(source, /disabled=\{switching\}/);
    assert.match(source, /serverSwitchError/);
  }
});

test("changing a stream URL remounts the third-party iframe", () => {
  const player = read("components/MobileFullscreenPlayer.tsx");

  assert.match(player, /key=\{src\}/);
});
