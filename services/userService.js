require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const util = require('util');

const scryptAsync = util.promisify(crypto.scrypt);
const KEY_LENGTH = 64;

// Neon PostgreSQL driver
let neon = null;
try {
  neon = require('@neondatabase/serverless').neon;
} catch (e) {
  // Optional driver
}

// Local JSON fallback
const isVercel = process.env.VERCEL || process.env.NOW_REGION;
const DATA_DIR = isVercel ? '/tmp' : path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function initLocalJSON() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify({}, null, 2), 'utf8');
    }
  } catch (e) {}
}

function readLocalUsers() {
  try {
    initLocalJSON();
    if (!fs.existsSync(USERS_FILE)) return {};
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(raw) || {};
  } catch (err) {
    return {};
  }
}

function writeLocalUsers(users) {
  try {
    initLocalJSON();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (err) {
    return false;
  }
}

// Database Connection Helper
function getSqlClient() {
  if (process.env.DATABASE_URL && neon) {
    return neon(process.env.DATABASE_URL);
  }
  return null;
}

let dbInitialized = false;
async function ensureTables() {
  const sql = getSqlClient();
  if (!sql || dbInitialized) return;

  try {
    await sql.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await sql.query(`
      CREATE TABLE IF NOT EXISTS watch_history (
        user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        source TEXT NOT NULL DEFAULT 'otakudesu',
        anime_slug TEXT NOT NULL,
        anime_title TEXT NOT NULL,
        episode_slug TEXT NOT NULL,
        episode_title TEXT NOT NULL,
        poster_url TEXT,
        anime_path TEXT NOT NULL DEFAULT '',
        episode_path TEXT NOT NULL DEFAULT '',
        watched_seconds DOUBLE PRECISION DEFAULT 0,
        duration_seconds DOUBLE PRECISION DEFAULT 0,
        progress_percent DOUBLE PRECISION DEFAULT 0,
        progress_source TEXT DEFAULT 'web',
        is_completed BOOLEAN NOT NULL DEFAULT FALSE,
        last_watched_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await sql.query(`
      CREATE TABLE IF NOT EXISTS watch_history_events (
        id TEXT PRIMARY KEY DEFAULT md5(random()::TEXT || clock_timestamp()::TEXT),
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        source TEXT NOT NULL DEFAULT 'otakudesu',
        anime_slug TEXT NOT NULL,
        anime_title TEXT NOT NULL,
        episode_slug TEXT NOT NULL,
        episode_title TEXT NOT NULL,
        poster_url TEXT,
        anime_path TEXT NOT NULL DEFAULT '',
        episode_path TEXT NOT NULL DEFAULT '',
        watched_seconds DOUBLE PRECISION DEFAULT 0,
        duration_seconds DOUBLE PRECISION DEFAULT 0,
        progress_percent DOUBLE PRECISION DEFAULT 0,
        progress_source TEXT DEFAULT 'web',
        is_completed BOOLEAN NOT NULL DEFAULT FALSE,
        last_watched_at TIMESTAMPTZ,
        watched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await sql.query(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id TEXT PRIMARY KEY DEFAULT md5(random()::TEXT || clock_timestamp()::TEXT),
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        slug TEXT NOT NULL,
        title TEXT NOT NULL,
        poster TEXT,
        score TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, slug)
      );
    `);
    dbInitialized = true;
    console.log('Neon PostgreSQL Database connected and tables verified.');
  } catch (err) {
    console.warn('Database initialization note:', err.message);
  }
}

// Initialize on startup
ensureTables();

// Password hashing & verification
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const key = await scryptAsync(password, salt, KEY_LENGTH);
  return `scrypt$${salt}$${key.toString('hex')}`;
}

async function verifyPassword(password, storedHash) {
  if (!storedHash) return false;

  // 1. scrypt format (scrypt$salt$hash)
  if (storedHash.startsWith('scrypt$')) {
    const parts = storedHash.split('$');
    if (parts.length === 3) {
      const salt = parts[1];
      const hash = parts[2];
      const expected = Buffer.from(hash, 'hex');
      const actual = await scryptAsync(password, salt, expected.length);
      if (actual.length !== expected.length) return false;
      return crypto.timingSafeEqual(actual, expected);
    }
  }

  // 2. pbkdf2 fallback
  try {
    const parts = storedHash.split('$');
    if (parts.length === 2) {
      const salt = parts[0];
      const hash = parts[1];
      const inputHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
      return inputHash === hash;
    }
  } catch (e) {}

  return false;
}

/**
 * Register User (Cloud Neon PostgreSQL or Local JSON)
 */
async function registerUser({ username, password, name }) {
  if (!username || typeof username !== 'string') {
    throw new Error('Username / Email wajib diisi');
  }

  const cleanIdentifier = username.trim().toLowerCase();
  if (cleanIdentifier.length < 3 || cleanIdentifier.length > 50) {
    throw new Error('Username / Email harus terdiri dari 3 - 50 karakter');
  }

  if (!password || password.length < 6) {
    throw new Error('Password minimal 6 karakter');
  }

  const sql = getSqlClient();

  if (sql) {
    await ensureTables();
    // Check if user exists in PostgreSQL
    const existing = await sql.query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanIdentifier]);
    if (existing && existing.length > 0) {
      throw new Error(`Pengguna dengan nama/email "${cleanIdentifier}" sudah terdaftar.`);
    }

    const userId = crypto.randomUUID ? crypto.randomUUID() : 'user_' + crypto.randomBytes(12).toString('hex');
    const hashedPassword = await hashPassword(password);

    await sql.query(
      'INSERT INTO users (id, email, password_hash, created_at) VALUES ($1, $2, $3, NOW())',
      [userId, cleanIdentifier, hashedPassword]
    );

    const displayName = name && name.trim() ? name.trim() : cleanIdentifier.split('@')[0];
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanIdentifier)}`;

    return {
      id: userId,
      username: cleanIdentifier,
      name: displayName,
      picture: avatar,
      createdAt: Date.now(),
      history: [],
      bookmarks: []
    };
  }

  // Local JSON fallback
  const users = readLocalUsers();
  const existingId = Object.keys(users).find(
    id => users[id].username && users[id].username.toLowerCase() === cleanIdentifier
  );

  if (existingId) {
    throw new Error(`Username "${cleanIdentifier}" sudah digunakan.`);
  }

  const userId = 'user_' + crypto.randomBytes(8).toString('hex');
  const salt = crypto.randomBytes(16).toString('hex');
  const hashedPassword = `pbkdf2$${salt}$${crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')}`;
  const displayName = name && name.trim() ? name.trim() : cleanIdentifier.split('@')[0];
  const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanIdentifier)}`;

  users[userId] = {
    id: userId,
    username: cleanIdentifier,
    name: displayName,
    picture: avatar,
    password: hashedPassword,
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
    history: [],
    bookmarks: []
  };

  writeLocalUsers(users);
  const { password: _, ...safeUser } = users[userId];
  return safeUser;
}

/**
 * Login User (Cloud Neon PostgreSQL or Local JSON)
 */
async function loginUser({ username, password }) {
  if (!username || !password) {
    throw new Error('Username dan password wajib diisi');
  }

  const cleanIdentifier = username.trim().toLowerCase();
  const sql = getSqlClient();

  if (sql) {
    await ensureTables();
    const rows = await sql.query('SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1', [cleanIdentifier]);

    if (!rows || rows.length === 0) {
      throw new Error('Akun tidak ditemukan. Silakan periksa kembali atau daftar akun baru.');
    }

    const userRow = rows[0];
    const isMatch = await verifyPassword(password, userRow.password_hash);

    if (!isMatch) {
      throw new Error('Password yang Anda masukkan salah.');
    }

    // Fetch watch history events from Neon DB
    let history = [];
    try {
      const historyRows = await sql.query(
        `SELECT DISTINCT ON (anime_slug) 
           anime_slug, anime_title, episode_slug, episode_title, poster_url, last_watched_at, watched_at
         FROM watch_history_events 
         WHERE user_id = $1 
         ORDER BY anime_slug, watched_at DESC 
         LIMIT 50`,
        [userRow.id]
      );
      history = (historyRows || []).map(r => ({
        animeSlug: r.anime_slug,
        animeTitle: r.anime_title,
        episodeSlug: r.episode_slug,
        episodeTitle: r.episode_title,
        poster: r.poster_url || '',
        lastWatchedAt: r.last_watched_at || r.watched_at
      }));
    } catch (e) {
      console.warn('History fetch note:', e.message);
    }

    // Fetch bookmarks from Neon DB
    let bookmarks = [];
    try {
      const bookmarkRows = await sql.query(
        'SELECT slug, title, poster, score FROM bookmarks WHERE user_id = $1 ORDER BY created_at DESC',
        [userRow.id]
      );
      bookmarks = (bookmarkRows || []).map(r => ({
        slug: r.slug,
        title: r.title,
        poster: r.poster,
        score: r.score
      }));
    } catch (e) {}

    const displayName = cleanIdentifier.split('@')[0];
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanIdentifier)}`;

    return {
      id: userRow.id,
      username: cleanIdentifier,
      name: displayName,
      picture: avatar,
      createdAt: userRow.created_at,
      history,
      bookmarks
    };
  }

  // Local JSON fallback
  const users = readLocalUsers();
  const userId = Object.keys(users).find(
    id => users[id].username && users[id].username.toLowerCase() === cleanIdentifier
  );

  if (!userId) {
    throw new Error('Username tidak ditemukan.');
  }

  const user = users[userId];
  const isMatch = await verifyPassword(password, user.password);

  if (!isMatch) {
    throw new Error('Password yang Anda masukkan salah.');
  }

  user.lastLoginAt = Date.now();
  writeLocalUsers(users);

  const { password: _, ...safeUser } = user;
  return safeUser;
}

/**
 * Get User By ID
 */
async function getUserById(userId) {
  const sql = getSqlClient();
  if (sql) {
    const rows = await sql.query('SELECT id, email, created_at FROM users WHERE id = $1', [userId]);
    if (!rows || rows.length === 0) return null;
    const u = rows[0];
    return {
      id: u.id,
      username: u.email,
      name: u.email.split('@')[0],
      picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.email)}`,
      createdAt: u.created_at
    };
  }

  const users = readLocalUsers();
  const user = users[userId];
  if (!user) return null;
  const { password: _, ...safeUser } = user;
  return safeUser;
}

/**
 * Sync Watch History & Bookmarks to PostgreSQL or Local JSON
 */
async function syncUserData(userId, { history = [], bookmarks = [] }) {
  const sql = getSqlClient();

  if (sql) {
    await ensureTables();

    // Sync History Events
    if (Array.isArray(history) && history.length > 0) {
      for (const item of history) {
        if (!item || !item.animeSlug) continue;
        try {
          await sql.query(
            `INSERT INTO watch_history_events 
               (user_id, source, anime_slug, anime_title, episode_slug, episode_title, poster_url, anime_path, episode_path, watched_at)
             VALUES 
               ($1, 'otakudesu', $2, $3, $4, $5, $6, $7, $8, NOW())
             ON CONFLICT (user_id, episode_path) 
             DO UPDATE SET watched_at = NOW(), episode_title = EXCLUDED.episode_title`,
            [
              userId,
              item.animeSlug,
              item.animeTitle || item.animeSlug,
              item.episodeSlug || item.animeSlug,
              item.episodeTitle || item.episodeSlug || 'Episode',
              item.poster || '',
              `/anime/${item.animeSlug}`,
              `/watch/${item.episodeSlug || item.animeSlug}`
            ]
          );
        } catch (e) {
          // Continue on individual sync item errors
        }
      }
    }

    // Sync Bookmarks
    if (Array.isArray(bookmarks) && bookmarks.length > 0) {
      for (const bm of bookmarks) {
        if (!bm || !bm.slug) continue;
        try {
          await sql.query(
            `INSERT INTO bookmarks (user_id, slug, title, poster, score, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW())
             ON CONFLICT (user_id, slug) 
             DO UPDATE SET title = EXCLUDED.title, poster = EXCLUDED.poster, score = EXCLUDED.score`,
            [userId, bm.slug, bm.title || bm.slug, bm.poster || '', bm.score || '']
          );
        } catch (e) {}
      }
    }

    return await getUserById(userId);
  }

  // Local JSON fallback
  const users = readLocalUsers();
  if (!users[userId]) return null;

  const user = users[userId];
  if (Array.isArray(history) && history.length > 0) {
    const existing = user.history || [];
    const map = new Map();
    history.forEach(i => i && i.animeSlug && map.set(i.animeSlug, i));
    existing.forEach(i => i && i.animeSlug && !map.has(i.animeSlug) && map.set(i.animeSlug, i));
    user.history = Array.from(map.values()).slice(0, 50);
  }

  if (Array.isArray(bookmarks) && bookmarks.length > 0) {
    const existingBm = user.bookmarks || [];
    const mapBm = new Map();
    bookmarks.forEach(i => i && i.slug && mapBm.set(i.slug, i));
    existingBm.forEach(i => i && i.slug && !mapBm.has(i.slug) && mapBm.set(i.slug, i));
    user.bookmarks = Array.from(mapBm.values());
  }

  writeLocalUsers(users);
  const { password: _, ...safeUser } = user;
  return safeUser;
}

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  syncUserData
};
