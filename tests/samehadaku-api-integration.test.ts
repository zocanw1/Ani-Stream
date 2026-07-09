import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path: string) {
  return readFileSync(path, "utf8");
}

test("Samehadaku client components never call the upstream domain directly", () => {
  for (const path of [
    "components/pages/HomePageClient.tsx",
    "components/pages/PopularPageClient.tsx",
    "components/pages/BatchPageClient.tsx",
    "components/pages/SearchPageClient.tsx",
  ]) {
    const source = read(path);

    assert.doesNotMatch(
      source,
      /https:\/\/www\.sankavollerei\.com\/anime\/samehadaku/,
      `${path} must use the AniStream API proxy`,
    );
  }
});

test("Samehadaku catalog proxy only exposes documented resources", () => {
  const route = read("app/api/anime/samehadaku/route.ts");

  for (const resource of [
    "home",
    "recent",
    "search",
    "ongoing",
    "completed",
    "popular",
    "movies",
    "list",
    "schedule",
    "genres",
    "genre",
    "batch",
  ]) {
    assert.ok(route.includes(`"${resource}"`), `proxy must support ${resource}`);
  }

  assert.match(route, /SIMPLE_RESOURCES/);
  assert.match(route, /GENRE_ID_PATTERN/);
  assert.match(route, /X-Upstream-Cache/);
  assert.match(route, /encodeURIComponent\(query\)/);
});

test("Samehadaku client pagination and search use the internal catalog proxy", () => {
  const home = read("components/pages/HomePageClient.tsx");
  const popular = read("components/pages/PopularPageClient.tsx");
  const batch = read("components/pages/BatchPageClient.tsx");
  const search = read("components/pages/SearchPageClient.tsx");

  assert.match(home, /\/api\/anime\/samehadaku\?resource=home/);
  assert.match(home, /\/api\/anime\/samehadaku\?resource=schedule/);
  assert.match(home, /\/api\/anime\/samehadaku\?resource=popular/);
  assert.match(home, /\/api\/anime\/samehadaku\?resource=ongoing&page=1/);
  assert.match(popular, /\/api\/anime\/samehadaku\?resource=popular&page=/);
  assert.match(batch, /\/api\/anime\/samehadaku\?resource=batch&page=/);
  assert.match(search, /\/api\/anime\/samehadaku\?resource=search&q=/);
});

test("workflow documents and protects the complete Samehadaku API contract", () => {
  const workflow = read("WORKFLOW.md");

  for (const endpoint of [
    "/anime/samehadaku/home",
    "/anime/samehadaku/recent?page=:page",
    "/anime/samehadaku/search?q=:query&page=:page",
    "/anime/samehadaku/ongoing?page=:page&order=:order",
    "/anime/samehadaku/completed?page=:page&order=:order",
    "/anime/samehadaku/popular?page=:page",
    "/anime/samehadaku/movies?page=:page&order=:order",
    "/anime/samehadaku/list",
    "/anime/samehadaku/schedule",
    "/anime/samehadaku/genres",
    "/anime/samehadaku/genres/:genreId?page=:page",
    "/anime/samehadaku/batch?page=:page",
    "/anime/samehadaku/anime/:animeId",
    "/anime/samehadaku/episode/:episodeId",
    "/anime/samehadaku/batch/:batchId",
    "/anime/samehadaku/server/:serverId",
  ]) {
    assert.ok(workflow.includes(endpoint), `WORKFLOW.md must document ${endpoint}`);
  }

  assert.match(workflow, /Jangan panggil domain upstream Samehadaku langsung dari Client Component/);
  assert.match(workflow, /animeId.*detail anime/is);
  assert.match(workflow, /episodeId.*detail episode/is);
});
