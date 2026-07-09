import { NextResponse } from "next/server";
import { upstreamFetch } from "@/lib/upstream-cache";

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
    const result = await upstreamFetch(upstreamPath, 5_000, 30_000);

    return NextResponse.json(result.payload, {
      status: result.ok ? result.status : 502,
      headers: { "X-Upstream-Cache": result.cached ? (result.stale ? "stale" : "hit") : "miss" },
    });
  } catch {
    return NextResponse.json(
      { message: "Gagal mengambil URL server streaming." },
      { status: 502 },
    );
  }
}
