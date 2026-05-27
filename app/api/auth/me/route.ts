import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { hasDatabaseUrl } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ user: null, databaseConfigured: false });
  }

  const user = await getCurrentUser();
  return NextResponse.json({ user, databaseConfigured: true });
}
