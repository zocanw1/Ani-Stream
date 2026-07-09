import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path: string) {
  return readFileSync(path, "utf8");
}

test("proxy endpoints use upstream cache with X-Upstream-Cache header", () => {
  const samehadaku = read("app/api/anime/samehadaku/route.ts");
  const server = read("app/api/anime/server/route.ts");
  const batch = read("app/api/anime/batch/route.ts");

  for (const route of [samehadaku, server, batch]) {
    assert.match(route, /upstreamFetch\(/);
    assert.match(route, /X-Upstream-Cache/);
    assert.doesNotMatch(route, /cache:\s*"no-store"/);
  }
});

test("samehadaku proxy routes through upstream cache at path /samehadaku/", () => {
  const route = read("app/api/anime/samehadaku/route.ts");

  assert.match(route, /`\/samehadaku\/search\?q=/);
  assert.match(route, /`\/samehadaku\/genres\//);
  assert.match(route, /`\/samehadaku\/\$\{resource\}/);
});

test("samehadaku proxy builds path for upstream-cache base (without duplicate /anime)", () => {
  const route = read("app/api/anime/samehadaku/route.ts");
  const cache = read("lib/upstream-cache.ts");

  assert.match(route, /upstreamFetch\(/);
  assert.doesNotMatch(route, /ANIME_API_BASE_URL/);
  assert.match(cache, /ANIME_API_BASE_URL/);
});

test("upstream cache uses throttled fetch from queue module", () => {
  const cache = read("lib/upstream-cache.ts");

  assert.match(cache, /import.*throttledFetch/);
  assert.match(cache, /throttledFetch\(/);

  const queue = read("lib/upstream-queue.ts");
  assert.match(queue, /MAX_CONCURRENT/);
  assert.match(queue, /MAX_PER_SECOND/);
});

test("upstream queue limits concurrent requests and requests per second", () => {
  const queue = read("lib/upstream-queue.ts");

  assert.match(queue, /MAX_CONCURRENT\s*=\s*3/);
  assert.match(queue, /MAX_PER_SECOND\s*=\s*8/);
  assert.match(queue, /activeCount\s*<\s*MAX_CONCURRENT/);
  assert.match(queue, /windowTimestamps\.length\s*<\s*MAX_PER_SECOND/);
});

test("upstream cache has stale-while-revalidate and TTL logic", () => {
  const cache = read("lib/upstream-cache.ts");

  assert.match(cache, /freshUntil/);
  assert.match(cache, /staleUntil/);
  assert.match(cache, /stale/);
  assert.match(cache, /dedupedFetch/);
});

test("upstream cache deduplicates concurrent requests for the same path", () => {
  const cache = read("lib/upstream-cache.ts");

  assert.match(cache, /inFlight/);
  assert.match(cache, /existing\.settled/);
  assert.match(cache, /inFlight\.delete\(/);
});

test("upstream cache cleanup removes expired stale entries every 60s", () => {
  const cache = read("lib/upstream-cache.ts");

  assert.match(cache, /60_000/);
  assert.match(cache, /staleUntil/);
  assert.match(cache, /store\.delete/);
});

test("upstream cache exports reset function for testing", () => {
  const cache = read("lib/upstream-cache.ts");

  assert.match(cache, /resetUpstreamCacheForTesting/);
});

test("upstream queue exports reset function for testing", () => {
  const queue = read("lib/upstream-queue.ts");

  assert.match(queue, /resetThrottleForTesting/);
});
