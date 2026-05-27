CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sessions_token_hash_idx
ON sessions(token_hash);

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
);

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
);

CREATE INDEX IF NOT EXISTS watch_history_events_user_watched_idx
ON watch_history_events(user_id, watched_at DESC);

CREATE INDEX IF NOT EXISTS watch_history_events_user_anime_watched_idx
ON watch_history_events(user_id, anime_slug, watched_at DESC);
