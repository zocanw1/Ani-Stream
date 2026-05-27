import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { hasDatabaseUrl } from "@/lib/db";
import { getLastWatchHistory, recordWatchHistory, type WatchHistoryPayload } from "@/lib/watch-history";

export const runtime = "nodejs";

export async function GET() {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ history: null, databaseConfigured: false });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ history: null, databaseConfigured: true });
  }

  return NextResponse.json({ history: await getLastWatchHistory(user.id), databaseConfigured: true });
}

export async function POST(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL belum diatur di Vercel." }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Login diperlukan." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as WatchHistoryPayload | null;
  const result = await recordWatchHistory(user.id, body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
