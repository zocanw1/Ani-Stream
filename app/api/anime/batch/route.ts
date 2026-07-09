import { NextResponse } from "next/server";
import { upstreamFetch } from "@/lib/upstream-cache";

const BATCH_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source");
  const batchId = searchParams.get("batchId") ?? "";

  if (!BATCH_ID_PATTERN.test(batchId)) {
    return NextResponse.json({ message: "Parameter batch tidak valid." }, { status: 400 });
  }

  let upstreamPath: string;
  if (source === "samehadaku") {
    upstreamPath = `/samehadaku/batch/${encodeURIComponent(batchId)}`;
  } else if (source === "otakudesu") {
    upstreamPath = `/batch/${encodeURIComponent(batchId)}`;
  } else {
    return NextResponse.json({ message: "Sumber batch tidak valid." }, { status: 400 });
  }

  try {
    const result = await upstreamFetch(upstreamPath, 30_000, 120_000);

    return NextResponse.json(result.payload, {
      status: result.ok ? result.status : 502,
      headers: { "X-Upstream-Cache": result.cached ? (result.stale ? "stale" : "hit") : "miss" },
    });
  } catch {
    return NextResponse.json(
      { message: "Gagal mengambil data batch." },
      { status: 502 },
    );
  }
}
