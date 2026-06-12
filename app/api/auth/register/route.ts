import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { hashPassword, isValidEmail, isValidPassword, normalizeEmail } from "@/lib/auth-core";
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

  const rateLimit = await checkAuthRateLimit(request, "register", email);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak pendaftaran. Coba lagi nanti." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Email tidak valid." }, { status: 400 });
  }

  if (!isValidPassword(password)) {
    return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });
  }

  await ensureDatabase();
  const passwordHash = await hashPassword(password);

  try {
    const rows = await getSql()`
      INSERT INTO users (id, email, password_hash)
      VALUES (${randomUUID()}, ${email}, ${passwordHash})
      RETURNING id, email
    `;

    const user = (rows as unknown as { id: string; email: string }[])[0];
    await createSession(user.id);

    return NextResponse.json({ user });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
    }

    return NextResponse.json({ error: "Gagal membuat akun." }, { status: 500 });
  }
}
