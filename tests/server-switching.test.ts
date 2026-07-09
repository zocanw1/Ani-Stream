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

test("episode clients resolve server URLs through the AniStream API proxy", () => {
  const samehadaku = read("app/anime/episode/[slug]/EpisodeDetailClient.tsx");
  const otakudesu = read("app/otakudesu/episode/[slug]/OtakudesuEpisodeClient.tsx");

  assert.match(samehadaku, /\/api\/anime\/server\?source=samehadaku&serverId=/);
  assert.match(otakudesu, /\/api\/anime\/server\?source=otakudesu&serverId=/);
  assert.doesNotMatch(samehadaku, /www\.sankavollerei\.com\/anime\/samehadaku\/server/);
  assert.doesNotMatch(otakudesu, /www\.sankavollerei\.com\/anime\/server/);
});

test("server proxy only forwards supported sources and safe server IDs", () => {
  const route = read("app/api/anime/server/route.ts");

  assert.match(route, /source === "samehadaku"/);
  assert.match(route, /source === "otakudesu"/);
  assert.match(route, /SERVER_ID_PATTERN/);
  assert.match(route, /X-Upstream-Cache/);
});
