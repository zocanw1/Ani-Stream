import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path: string) {
  return readFileSync(path, "utf8");
}

test("Otakudesu unlimited list is fetched by a Server Component", () => {
  const page = read("app/otakudesu/anime/unlimited/page.tsx");
  const client = read("components/otakudesu/UnlimitedClient.tsx");

  assert.doesNotMatch(page, /^"use client";/);
  assert.match(page, /fetchAnimeApi/);
  assert.match(page, /"\/unlimited"/);
  assert.doesNotMatch(page, /useEffect|www\.sankavollerei\.com/);
  assert.doesNotMatch(client, /useEffect|www\.sankavollerei\.com/);
});

test("batch requests use the source-aware AniStream proxy", () => {
  const otakudesu = read("app/otakudesu/anime/[slug]/OtakudesuDetailClient.tsx");
  const samehadaku = read("app/anime/[slug]/AnimeDetailClient.tsx");
  const batchPage = read("app/anime/batch/[slug]/page.tsx");

  assert.match(otakudesu, /\/api\/anime\/batch\?source=otakudesu&batchId=/);
  assert.match(samehadaku, /\/api\/anime\/batch\?source=samehadaku&batchId=/);
  assert.match(batchPage, /\/api\/anime\/batch\?source=samehadaku&batchId=/);
  assert.doesNotMatch(otakudesu, /www\.sankavollerei\.com\/anime\/batch/);
  assert.doesNotMatch(samehadaku, /www\.sankavollerei\.com\/anime\/batch/);
  assert.doesNotMatch(batchPage, /www\.sankavollerei\.com\/anime\/batch/);
});

test("batch proxy maps each provider to its documented endpoint", () => {
  const route = read("app/api/anime/batch/route.ts");

  assert.match(route, /source === "samehadaku"/);
  assert.match(route, /`\/samehadaku\/batch\/\$\{encodeURIComponent\(batchId\)\}`/);
  assert.match(route, /source === "otakudesu"/);
  assert.match(route, /`\/batch\/\$\{encodeURIComponent\(batchId\)\}`/);
  assert.match(route, /BATCH_ID_PATTERN/);
  assert.match(route, /X-Upstream-Cache/);
});

test("workflow protects the documented Otakudesu API contract", () => {
  const workflow = read("WORKFLOW.md");

  for (const endpoint of [
    "/anime/home",
    "/anime/schedule",
    "/anime/anime/:slug",
    "/anime/complete-anime?page=:page",
    "/anime/ongoing-anime?page=:page",
    "/anime/genre",
    "/anime/genre/:slug?page=:page",
    "/anime/episode/:slug",
    "/anime/search/:keyword",
    "/anime/batch/:slug",
    "/anime/server/:serverId",
    "/anime/unlimited",
  ]) {
    assert.ok(workflow.includes(endpoint), `WORKFLOW.md must document ${endpoint}`);
  }

  assert.match(workflow, /Jangan panggil domain upstream langsung dari Client Component/);
  assert.match(workflow, /serverId.*detail episode/is);
  assert.match(workflow, /batchId.*detail anime/is);
});
