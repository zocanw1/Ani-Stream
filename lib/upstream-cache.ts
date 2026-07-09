import { throttledFetch } from "./upstream-queue";

const ANIME_API_BASE_URL = "https://www.sankavollerei.com/anime";

type CacheEntry<T> = {
  data: T;
  freshUntil: number;
  staleUntil: number;
};

type InFlightEntry = {
  promise: Promise<unknown>;
  settled: boolean;
};

const store = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, InFlightEntry>();

let nextCleanup = 0;

function now() {
  return Date.now();
}

function cleanup() {
  const t = now();
  if (t < nextCleanup) return;
  nextCleanup = t + 60_000;
  for (const [key, entry] of store) {
    if (t >= entry.staleUntil) store.delete(key);
  }
}

function cacheKey(path: string) {
  return `anime:${path}`;
}

function fetchJson(path: string) {
  return throttledFetch(`${ANIME_API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
  }).then((res) =>
    res.json().then((data) => ({ status: res.status, ok: res.ok, data })),
  );
}

async function dedupedFetch(path: string) {
  const key = cacheKey(path);
  const existing = inFlight.get(key);
  if (existing && !existing.settled) return existing.promise;

  const entry: InFlightEntry = { promise: fetchJson(path), settled: false };
  inFlight.set(key, entry);
  try {
    const result = await entry.promise;
    return result;
  } finally {
    entry.settled = true;
    inFlight.delete(key);
  }
}

export type UpstreamResponse = {
  status: number;
  ok: boolean;
  payload: unknown;
  cached: boolean;
  stale: boolean;
};

function toResponse(result: { status: number; ok: boolean; data: unknown }, cached: boolean, stale: boolean): UpstreamResponse {
  return { status: result.status, ok: result.ok, payload: result.data, cached, stale };
}

export async function upstreamFetch(path: string, ttlMs: number, staleTtlMs: number): Promise<UpstreamResponse> {
  cleanup();

  const key = cacheKey(path);
  const cached = store.get(key) as CacheEntry<unknown> | undefined;
  const t = now();

  if (cached) {
    if (t < cached.freshUntil) {
      return toResponse(cached.data as { status: number; ok: boolean; data: unknown }, true, false);
    }
    if (t < cached.staleUntil) {
      dedupedFetch(path).then((fresh) => {
        store.set(key, {
          data: fresh as { status: number; ok: boolean; data: unknown },
          freshUntil: t + ttlMs,
          staleUntil: t + staleTtlMs,
        });
      });
      return toResponse(cached.data as { status: number; ok: boolean; data: unknown }, true, true);
    }
  }

  const result = await dedupedFetch(path) as { status: number; ok: boolean; data: unknown };
  store.set(key, {
    data: result,
    freshUntil: t + ttlMs,
    staleUntil: t + staleTtlMs,
  });
  return toResponse(result, false, false);
}

export function resetUpstreamCacheForTesting() {
  store.clear();
  inFlight.clear();
  nextCleanup = 0;
}
