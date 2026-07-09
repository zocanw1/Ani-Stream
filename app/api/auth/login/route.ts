import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { normalizeEmail, verifyPassword } from "@/lib/auth-core";
import { ensureDatabase, getSql, hasDatabaseUrl } from "@/lib/db";
import { checkAuthRateLimit } from "@/lib/auth-rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "DATABASE_URL belum diatur di Vercel." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const email = normalizeEmail(String(body?.email || ""));
  const password = String(body?.password || "");

  const rateLimit = await checkAuthRateLimit(request, "login", email);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan login. Coba lagi nanti." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  await ensureDatabase();
  const rows = await getSql()`
    SELECT id, email, password_hash
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `;

  const user = (rows as unknown as { id: string; email: string; password_hash: string }[])[0];
  if (!user) {
    return NextResponse.json({ error: "Maaf email tidak terdaftar." }, { status: 401 });
  }
  if (!(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: "Kata sandi salah." }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({ user: { id: user.id, email: user.email } });
}
