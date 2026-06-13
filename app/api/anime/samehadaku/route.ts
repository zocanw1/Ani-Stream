import { NextResponse } from "next/server";

const ANIME_API_BASE_URL = "https://www.sankavollerei.com/anime/samehadaku";
const GENRE_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
const ORDER_PATTERN = /^[A-Za-z-]+$/;
const SIMPLE_RESOURCES = new Set([
  "home",
  "recent",
  "ongoing",
  "completed",
  "popular",
  "movies",
  "list",
  "schedule",
  "genres",
  "batch",
]);
const PAGINATED_RESOURCES = new Set([
  "recent",
  "ongoing",
  "completed",
  "popular",
  "movies",
  "batch",
]);
const ORDERED_RESOURCES = new Set(["ongoing", "completed", "movies"]);

function normalizePage(value: string | null) {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isInteger(page) && page > 0 && page <= 10_000 ? page : 1;
}

function buildUpstreamPath(searchParams: URLSearchParams) {
  const resource = searchParams.get("resource") ?? "";
  const page = normalizePage(searchParams.get("page"));

  if (resource === "search") {
    const query = (searchParams.get("q") ?? "").trim().slice(0, 100);
    if (!query) return null;
    return `/search?q=${encodeURIComponent(query)}&page=${page}`;
  }

  if (resource === "genre") {
    const genreId = searchParams.get("genreId") ?? "";
    if (!GENRE_ID_PATTERN.test(genreId)) return null;
    return `/genres/${encodeURIComponent(genreId)}?page=${page}`;
  }

  if (!SIMPLE_RESOURCES.has(resource)) return null;

  const upstreamParams = new URLSearchParams();
  if (PAGINATED_RESOURCES.has(resource)) {
    upstreamParams.set("page", String(page));
  }

  if (ORDERED_RESOURCES.has(resource)) {
    const order = searchParams.get("order") ?? "";
    if (order && ORDER_PATTERN.test(order)) {
      upstreamParams.set("order", order);
    }
  }

  const queryString = upstreamParams.toString();
  return `/${resource}${queryString ? `?${queryString}` : ""}`;
}

export async function GET(request: Request) {
  const upstreamPath = buildUpstreamPath(new URL(request.url).searchParams);
  if (!upstreamPath) {
    return NextResponse.json(
      { message: "Parameter endpoint Samehadaku tidak valid." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const response = await fetch(`${ANIME_API_BASE_URL}${upstreamPath}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    const payload = await response.json();

    return NextResponse.json(payload, {
      status: response.ok ? 200 : response.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { message: "Gagal mengambil data Samehadaku." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
