import { NextResponse } from "next/server";

const ANIME_API_BASE_URL = "https://www.sankavollerei.com/anime";
const SERVER_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source");
  const serverId = searchParams.get("serverId") ?? "";

  if (!SERVER_ID_PATTERN.test(serverId)) {
    return NextResponse.json({ message: "Parameter server tidak valid." }, { status: 400 });
  }

  let upstreamPath: string;
  if (source === "samehadaku") {
    upstreamPath = `/samehadaku/server/${encodeURIComponent(serverId)}`;
  } else if (source === "otakudesu") {
    upstreamPath = `/server/${encodeURIComponent(serverId)}`;
  } else {
    return NextResponse.json({ message: "Parameter server tidak valid." }, { status: 400 });
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
      { message: "Gagal mengambil URL server streaming." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
