import { createHash, randomBytes, randomUUID } from "crypto";
import { cookies } from "next/headers";
import { ensureDatabase, getSql, hasDatabaseUrl } from "./db";

export const SESSION_COOKIE = "anistream_session";
const SESSION_DAYS = 30;

export type CurrentUser = {
  id: string;
  email: string;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function sessionExpiresAt() {
  const date = new Date();
  date.setDate(date.getDate() + SESSION_DAYS);
  return date;
}

export async function createSession(userId: string) {
  await ensureDatabase();

  const sql = getSql();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = sessionExpiresAt();

  await sql`
    INSERT INTO sessions (id, user_id, token_hash, expires_at)
    VALUES (${randomUUID()}, ${userId}, ${hashToken(token)}, ${expiresAt.toISOString()})
  `;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token && hasDatabaseUrl()) {
    try {
      await ensureDatabase();
      await getSql()`DELETE FROM sessions WHERE token_hash = ${hashToken(token)}`;
    } catch {
      // Cookie cleanup should still happen if the database is unavailable.
    }
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!hasDatabaseUrl()) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  await ensureDatabase();
  const rows = await getSql()`
    SELECT users.id, users.email
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ${hashToken(token)}
      AND sessions.expires_at > NOW()
    LIMIT 1
  `;

  const user = (rows as unknown as CurrentUser[])[0];
  return user ?? null;
}
