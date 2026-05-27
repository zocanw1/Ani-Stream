import { neon } from "@neondatabase/serverless";

type SqlClient = ReturnType<typeof neon>;

let sqlClient: SqlClient | null = null;
let schemaPromise: Promise<void> | null = null;

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!sqlClient) {
    sqlClient = neon(process.env.DATABASE_URL);
  }

  return sqlClient;
}

export async function ensureDatabase() {
  if (!schemaPromise) {
    const sql = getSql();
    schemaPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token_hash TEXT NOT NULL UNIQUE,
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS sessions_token_hash_idx
        ON sessions(token_hash)
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS watch_history (
          user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          source TEXT NOT NULL,
          anime_slug TEXT NOT NULL,
          anime_title TEXT NOT NULL,
          episode_slug TEXT NOT NULL,
          episode_title TEXT NOT NULL,
          poster_url TEXT,
          anime_path TEXT NOT NULL,
          episode_path TEXT NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS watch_history_events (
          id TEXT PRIMARY KEY DEFAULT md5(random()::TEXT || clock_timestamp()::TEXT),
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          source TEXT NOT NULL,
          anime_slug TEXT NOT NULL,
          anime_title TEXT NOT NULL,
          episode_slug TEXT NOT NULL,
          episode_title TEXT NOT NULL,
          poster_url TEXT,
          anime_path TEXT NOT NULL,
          episode_path TEXT NOT NULL,
          watched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (user_id, episode_path)
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS watch_history_events_user_watched_idx
        ON watch_history_events(user_id, watched_at DESC)
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS watch_history_events_user_anime_watched_idx
        ON watch_history_events(user_id, anime_slug, watched_at DESC)
      `;
    })();
  }

  return schemaPromise;
}
