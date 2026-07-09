# AniStream API Documentation

Base URL: `https://[domain]` (production) / `http://localhost:3000` (development)

---

## Authentication

### `POST /api/auth/register`

Membuat akun baru dan langsung login.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "minimal6karakter"
}
```

**Response `201`:**

```json
{
  "user": { "id": "uuid", "email": "user@example.com" }
}
```

**Error Responses:**

| Status | Kondisi |
|--------|---------|
| `400` | Email tidak valid / password < 6 karakter |
| `409` | Email sudah terdaftar |
| `429` | Terlalu banyak percobaan (header `Retry-After`) |
| `503` | `DATABASE_URL` belum dikonfigurasi |

---

### `POST /api/auth/login`

Login dengan email dan password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response `200`:**

```json
{
  "user": { "id": "uuid", "email": "user@example.com" }
}
```

**Error Responses:**

| Status | Kondisi |
|--------|---------|
| `401` | Email atau password salah |
| `429` | Rate limit terlampaui (header `Retry-After`) |
| `503` | `DATABASE_URL` belum dikonfigurasi |

**Rate Limit:**
- Per alamat IP: 20 percobaan / 15 menit
- Per akun: 8 percobaan / 15 menit

---

### `POST /api/auth/logout`

Menghapus session cookie.

**Response `200`:**

```json
{ "ok": true }
```

---

### `GET /api/auth/me`

Mengembalikan user yang sedang login (berdasarkan cookie).

**Response `200` (terautentikasi):**

```json
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "databaseConfigured": true
}
```

**Response `200` (anonim):**

```json
{
  "user": null,
  "databaseConfigured": true
}
```

Jika `DATABASE_URL` belum diatur, `databaseConfigured` bernilai `false`.

---

## Watch History

### `GET /api/watch`

Mengambil riwayat tontonan terakhir user yang sedang login.

**Response `200` (terautentikasi, ada history):**

```json
{
  "history": {
    "source": "samehadaku",
    "anime_slug": "one-piece",
    "anime_title": "One Piece",
    "episode_slug": "one-piece-episode-1000",
    "episode_title": "One Piece Episode 1000",
    "poster_url": "https://...",
    "anime_path": "/anime/one-piece",
    "episode_path": "/anime/episode/one-piece-episode-1000",
    "watched_at": "2026-06-29T12:00:00Z",
    "watched_seconds": 300,
    "duration_seconds": 1200,
    "progress_percent": 25,
    "progress_source": "player",
    "is_completed": false,
    "last_watched_at": "2026-06-29T12:05:00Z"
  },
  "databaseConfigured": true
}
```

**Response `200` (tidak ada history):**

```json
{
  "history": null,
  "databaseConfigured": true
}
```

---

### `POST /api/watch`

Mencatat aktivitas menonton. Wajib login. Episode langsung tersimpan saat halaman dibuka.

**Request Body:**

```json
{
  "source": "samehadaku",
  "animeSlug": "one-piece",
  "animeTitle": "One Piece",
  "episodeSlug": "one-piece-episode-1000",
  "episodeTitle": "One Piece Episode 1000",
  "posterUrl": "https://...",
  "animePath": "/anime/one-piece",
  "episodePath": "/anime/episode/one-piece-episode-1000",
  "progress": {
    "watchedSeconds": 300,
    "durationSeconds": 1200,
    "progressPercent": 25,
    "progressSource": "player",
    "isCompleted": false,
    "recordedAt": "2026-06-29T12:05:00Z"
  }
}
```

Field `progress` bersifat opsional. Jika tidak dikirim, hanya metadata episode yang dicatat.

**Response `200`:**

```json
{ "ok": true }
```

**Error Responses:**

| Status | Kondisi |
|--------|---------|
| `400` | Data tontonan tidak lengkap |
| `401` | Belum login |
| `503` | `DATABASE_URL` belum dikonfigurasi |

> **Catatan:** Client mengirim `keepalive: true` dan `sendBeacon` saat `pagehide`/`visibilitychange` agar data tidak hilang meskipun pengguna menutup tab.

---

## Proxy Catalog — Samehadaku

### `GET /api/anime/samehadaku?resource={resource}&page={page}&order={order}&q={query}&genreId={genreId}`

Proxy client-side untuk API Samehadaku. Mencegah CSP/redirect blocking.

**Parameter:**

| Parameter | Tipe | Required | Default | Keterangan |
|-----------|------|----------|---------|------------|
| `resource` | string | ya | — | Nama resource (lihat tabel) |
| `page` | number | tidak | `1` | Maks 10.000 |
| `order` | string | tidak | — | Format: huruf dan `-` (alfabet) |
| `q` | string | jika `resource=search` | — | Maks 100 karakter |
| `genreId` | string | jika `resource=genre` | — | Format: `A-Za-z0-9_-` |

**Resource yang didukung:**

| Resource | Pagination | Order | Deskripsi |
|----------|-----------|-------|-----------|
| `home` | — | — | Halaman utama Samehadaku |
| `recent` | ✓ | — | Anime terbaru |
| `search` | ✓ | — | Pencarian (wajib `q`) |
| `ongoing` | ✓ | ✓ | Anime tayang |
| `completed` | ✓ | ✓ | Anime tamat |
| `popular` | ✓ | — | Anime populer |
| `movies` | ✓ | ✓ | Film anime |
| `list` | — | — | Semua anime A-Z |
| `schedule` | — | — | Jadwal mingguan |
| `genres` | — | — | Daftar genre |
| `genre` | ✓ | — | Anime per genre (wajib `genreId`) |
| `batch` | ✓ | — | Daftar batch download |

**Response `200`:**

```json
{
  "data": {
    "animeList": [
      {
        "title": "One Piece",
        "animeId": "one-piece",
        "poster": "https://...",
        "href": "/samehadaku/anime/one-piece"
      }
    ]
  }
}
```

**Error Responses:**

| Status | Kondisi |
|--------|---------|
| `400` | Parameter resource/q/genreId tidak valid |
| `502` | Gagal mengambil data dari upstream |

---

## Proxy — Batch Download

### `GET /api/anime/batch?source={source}&batchId={batchId}`

Proxy untuk mengambil detail batch download.

**Parameter:**

| Parameter | Tipe | Required | Keterangan |
|-----------|------|----------|------------|
| `source` | string | ya | `samehadaku` atau `otakudesu` |
| `batchId` | string | ya | ID batch dari respons API (format: `A-Za-z0-9_-`) |

**Response `200`:**

```json
{
  "data": {
    "batch": {
      "title": "One Piece Batch 1001-1010",
      "downloads": []
    }
  }
}
```

**Error Responses:**

| Status | Kondisi |
|--------|---------|
| `400` | Parameter batch/source tidak valid |
| `502` | Gagal mengambil data batch |

> `batchId` WAJIB berasal dari `data.batch.batchId` (Otakudesu) atau `data.batchList[]` (Samehadaku). Jangan dibuat dari slug anime.

---

## Proxy — Server Streaming

### `GET /api/anime/server?source={source}&serverId={serverId}`

Proxy untuk mengganti server streaming/player.

**Parameter:**

| Parameter | Tipe | Required | Keterangan |
|-----------|------|----------|------------|
| `source` | string | ya | `samehadaku` atau `otakudesu` |
| `serverId` | string | ya | ID server dari respons episode (format: `A-Za-z0-9_-`) |

**Response `200`:**

```json
{
  "data": {
    "server": {
      "url": "https://...streaming-url..."
    }
  }
}
```

**Error Responses:**

| Status | Kondisi |
|--------|---------|
| `400` | Parameter server/source tidak valid |
| `502` | Gagal mengambil URL server streaming |

> `serverId` WAJIB berasal dari `data.server.qualities[].serverList[]`. Jangan dibuat manual.

---

## Streaming API (Upstream — Episode Detail)

Endpoint upstream yang dipanggil Server Component untuk mendapatkan data episode termasuk URL streaming. Hasilnya dirender di halaman dan user bisa ganti server lewat proxy.

### Samehadaku: `GET https://www.sankavollerei.com/anime/samehadaku/episode/{episodeId}`

Dipanggil oleh Server Component `app/anime/episode/[slug]/page.tsx` saat user membuka halaman nonton.

**Parameter:**

| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `episodeId` | string | ID episode (slug), misal `one-piece-episode-1000` |

**Response `200` (data):**

```json
{
  "data": {
    "title": "One Piece Episode 1000 Subtitle Indonesia",
    "animeId": "one-piece",
    "poster": "https://...poster.jpg",
    "releasedOn": "2026-06-29",
    "defaultStreamingUrl": "https://...video-stream-url...",
    "hasPrevEpisode": true,
    "prevEpisode": { "title": "Episode 999", "episodeId": "...", "href": "/samehadaku/episode/..." },
    "hasNextEpisode": true,
    "nextEpisode": { "title": "Episode 1001", "episodeId": "...", "href": "/samehadaku/episode/..." },
    "synopsis": { "paragraphs": ["ringkasan episode..."] },
    "genreList": [{ "title": "Action", "genreId": "action", "href": "/genre/action" }],
    "server": {
      "qualities": [
        {
          "title": "360p",
          "serverList": [{ "title": "Server A", "serverId": "abc123", "href": "/server/abc123" }]
        },
        {
          "title": "720p",
          "serverList": [
            { "title": "Server B", "serverId": "def456", "href": "/server/def456" },
            { "title": "Server C", "serverId": "ghi789", "href": "/server/ghi789" }
          ]
        }
      ]
    },
    "downloadUrl": {
      "formats": [
        {
          "title": "MP4",
          "qualities": [
            {
              "title": "360p",
              "urls": [{ "title": "ZippyShare", "url": "https://..." }]
            }
          ]
        }
      ]
    },
    "recommendedEpisodeList": [...],
    "movie": { "href": "...", "animeList": [...] }
  }
}
```

### Otakudesu: `GET https://www.sankavollerei.com/anime/episode/{slug}`

Dipanggil oleh Server Component `app/otakudesu/episode/[slug]/page.tsx`.

**Parameter:**

| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `slug` | string | Slug episode, misal `episode-1000` |

**Response `200` (data):**

```json
{
  "data": {
    "title": "One Piece Episode 1000 Subtitle Indonesia",
    "animeId": "one-piece",
    "releaseTime": "2026-06-29",
    "defaultStreamingUrl": "https://...video-stream-url...",
    "hasPrevEpisode": true,
    "prevEpisode": { "title": "Episode 999", "episodeId": "...", "href": "/anime/episode/..." },
    "hasNextEpisode": true,
    "nextEpisode": { "title": "Episode 1001", "episodeId": "...", "href": "/anime/episode/..." },
    "server": {
      "qualities": [
        {
          "title": "360p",
          "serverList": [{ "title": "Desustream", "serverId": "server123", "href": "/server/server123" }]
        },
        {
          "title": "720p",
          "serverList": [{ "title": "Zippy", "serverId": "server456", "href": "/server/server456" }]
        }
      ]
    },
    "downloadUrl": {
      "qualities": [
        {
          "title": "360p",
          "urls": [{ "title": "ZippyShare", "url": "https://..." }]
        }
      ]
    },
    "info": {
      "credit": "Otakudesu",
      "duration": "24 min",
      "type": "TV Series",
      "genreList": [...],
      "episodeList": [
        { "title": "Episode 1000", "eps": 1000, "date": "2026-06-29", "episodeId": "...", "href": "/anime/episode/..." }
      ]
    }
  }
}
```

### Proxy Server Streaming: `GET /api/anime/server?source={source}&serverId={serverId}`

Client Component memanggil endpoint ini saat user mengganti server streaming.

**Alur lengkap streaming:**

```text
[Halaman Episode Dibuka]
       │
       ▼
Server Component ──► GET upstream/episode/{slug}
       │                  │
       │                  ▼
       │           { defaultStreamingUrl, server.qualities[] }
       │
       ▼
Render halaman + iframe(src=defaultStreamingUrl)
       │
       │  [User klik server lain]
       │
       ▼
Client Component ──► GET /api/anime/server?source=...&serverId=...
       │                  │
       │                  ▼
       │           Proxy ──► GET upstream/server/{serverId}
       │                  │
       │                  ▼
       │           { data: { url: "https://video-provider.com/..." } }
       │
       ▼
Iframe ganti src ke URL baru ──► Video streaming dari provider pihak ketiga
       │
       ▼
iframe postMessage(currentTime, duration)
       │
       ▼
normalizePlayerProgress() ──► CustomEvent("anistream:player-progress")
       │
       ▼
WatchRecorder ──► POST /api/watch (progress update)
```

### Catatan Streaming

1. **`defaultStreamingUrl`** adalah URL video bawaan dari provider — langsung di-render di iframe saat halaman pertama kali dibuka.
2. **`server.qualities[].serverList[]`** berisi daftar server alternatif. `serverId` wajib dikirim ke proxy untuk di-resolve ke URL streaming asli.
3. **Proxy `/api/anime/server`** mencegah browser kena redirect domain upstream dan CSP blocking.
4. **URL video asli** (dari proxy) langsung dipasang ke `<iframe>` — video distream dari domain provider pihak ketiga (Desustream, Zippy, dll).
5. **Progress tracking** hanya aktif jika iframe provider mengirim `postMessage` berisi posisi video real. AniStream tidak membuat estimasi dari lama halaman terbuka.

---


## Server Component API (tidak untuk client)

Endpoint berikut dipanggil langsung oleh Server Component Next.js melalui `fetchAnimeApi()`, bukan dari browser.

### `fetchAnimeApi(path, revalidate)`

Helper di `lib/anime-api.ts` untuk memanggil upstream `https://www.sankavollerei.com/anime{path}`.

**Parameter:**

| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `path` | string | Path endpoint, misal `/home`, `/samehadaku/home` |
| `revalidate` | number | Cache revalidation dalam detik |

**Upstream paths yang digunakan:**

| Path | Revalidate | Halaman |
|------|-----------|---------|
| `/home` | 3600 | Home Otakudesu |
| `/samehadaku/home` | 1800 | Home Samehadaku |
| `/anime/:slug` | — | Detail anime Samehadaku |
| `/samehadaku/anime/:animeId` | — | Detail anime Samehadaku |
| `/episode/:slug` | — | Detail episode Otakudesu |
| `/samehadaku/episode/:episodeId` | — | Detail episode Samehadaku |
| `/batch/:slug` | — | Detail batch Otakudesu |
| `/samehadaku/batch/:batchId` | — | Detail batch Samehadaku |
| `/server/:serverId` | — | Server streaming Otakudesu |
| `/samehadaku/server/:serverId` | — | Server streaming Samehadaku |
| `/search/:keyword` | — | Pencarian Otakudesu |
| `/samehadaku/search?q=:query` | — | Pencarian Samehadaku |
| `/complete-anime?page=:page` | 3600 | Anime tamat Otakudesu |
| `/ongoing-anime?page=:page` | 3600 | Anime ongoing Otakudesu |
| `/genre` | 86400 | Daftar genre Otakudesu |
| `/genre/:slug?page=:page` | 3600 | Anime per genre Otakudesu |
| `/unlimited` | 86400 | Semua anime Otakudesu A-Z |
| `/schedule` | 3600 | Jadwal Otakudesu |

---

## Authentication Flow

```
Browser                    Server (Next.js)              Neon Database
  │                             │                             │
  │  POST /api/auth/register    │                             │
  │  { email, password }        │                             │
  │ ──────────────────────────► │                             │
  │                             │  INSERT users (scrypt hash) │
  │                             │ ───────────────────────────►│
  │                             │◄─────────────────────────── │
  │                             │  INSERT sessions            │
  │                             │ ───────────────────────────►│
  │  ◄── Set-Cookie ─────────── │◄─────────────────────────── │
  │                             │                             │
  │  GET /api/auth/me           │                             │
  │  Cookie: anistream_session  │                             │
  │ ──────────────────────────► │                             │
  │                             │  SELECT sessions + users    │
  │                             │ ───────────────────────────►│
  │  ◄── { user } ──────────── │◄─────────────────────────── │
```

## Watch Recording Flow

```
Browser                               Server                       Neon DB
  │                                     │                            │
  │  Buka halaman episode               │                            │
  │ ──────────────────────────────────────────────────────────────────►
  │  POST /api/watch (metadata only)    │                            │
  │  { source, animeSlug, episodeSlug } │                            │
  │ ───────────────────────────────────►│                            │
  │                                     │ INSERT watch_history_events│
  │                                     │ ──────────────────────────►│
  │                                     │ UPSERT watch_history       │
  │                                     │ ──────────────────────────►│
  │                                     │◄────────────────────────── │
  │                                     │                            │
  │  iframe postMessage (progress)      │                            │
  │ ──────────────────────────────────────────────────────────────────►
  │  -> normalizePlayerProgress()       │                            │
  │  -> dispatch custom event           │                            │
  │                                     │                            │
  │  POST /api/watch (progress update)  │                            │
  │  { ..., progress: { ... } }         │                            │
  │ ───────────────────────────────────►│                            │
  │                                     │ UPDATE progress columns    │
  │                                     │ ──────────────────────────►│
  │                                     │◄────────────────────────── │
  │                                     │                            │
  │  pagehide / visibilitychange        │                            │
  │  -> sendBeacon / fetch keepalive    │                            │
  │ ───────────────────────────────────►│                            │
```

## Rate Limit Protection

Upstream API (`https://www.sankavollerei.com/anime`) memberlakukan **50 request/menit per IP**. Karena semua request dari server Vercel keluar dari 1 IP, AniStream menerapkan 3 lapis proteksi:

### 1. Request Deduplication (`lib/upstream-cache.ts`)

Request ke URL upstream yang **sama dalam waktu bersamaan** digabung menjadi 1. Contoh: 50 user ganti server ke `serverId=xyz` secara simultan → hanya **1 request** ke upstream.

### 2. Cache + Stale-While-Revalidate

| Proxy Endpoint | Fresh TTL | Stale TTL | Dampak |
|----------------|-----------|-----------|--------|
| `/api/anime/server` | 5 detik | 30 detik | Server URL tahan 5 detik, 25 detik berikutnya serve stale + revalidate background |
| `/api/anime/batch` | 30 detik | 120 detik | Data batch tahan 30 detik |
| `/api/anime/samehadaku` | 30 detik | 120 detik | Data katalog tahan 30 detik |

### 3. Concurrent + Rate Throttle (`lib/upstream-queue.ts`)

- **Maks 3 request concurrent** ke upstream dalam satu waktu
- **Maks 8 request per detik** (sliding window)
- Request kelebihan antri sampai ada slot kosong

### Response Header

Semua proxy endpoint menyertakan header `X-Upstream-Cache`:

| Value | Arti |
|-------|------|
| `hit` | Data dari cache fresh — 0 hit upstream |
| `stale` | Data dari cache stale, revalidate background — 0 hit upstream untuk response ini |
| `miss` | Data baru dari upstream — 1 hit upstream |

### Estimasi Hit Upstream

Skenario 1000 user serempak gonta-ganti server:

| Tanpa Proteksi | Dengan Proteksi |
|----------------|-----------------|
| 1000 request/menit → **BAN** | ~3-8 request/menit → **Aman** |

---

## Security Headers

Semua response dari Next.js menyertakan:

| Header | Value |
|--------|-------|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://www.sankavollerei.com; frame-src https:; media-src 'self' blob: https:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

## Catatan Penting

1. **Proxy endpoints** menggunakan upstream cache + throttle untuk melindungi dari rate limit upstream (50 req/menit). Response header `X-Upstream-Cache` menunjukkan apakah data dari cache.
2. **Server Component** memakai `fetchAnimeApi()` dengan cache Next.js bawaan (`next: { revalidate }`).
3. **Session** disimpan dalam cookie `anistream_session` (httpOnly, sameSite=lax, secure di production).
4. **Password** di-hash dengan scrypt (salt 16-byte, key length 64).
5. **Rate limit auth** dihapus otomatis setelah 2 hari (`DELETE FROM auth_rate_limits WHERE updated_at < NOW() - INTERVAL '2 days'`).
