# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js on port 3000+, fallback to next available)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
npm run test     # Run ALL tests (tsx --test tests/**/*.test.ts)
```

There is no way to run a single test file. Tests use Node's built-in `node:test` + `assert/strict`.

## Architecture

### Two Data Providers
Samehadaku (default homepage) and Otakudesu. They are **not interchangeable** — endpoint prefixes, IDs, and response shapes differ. `fetchAnimeApi()` and proxy routes use `source=samehadaku` / `source=otakudesu` to select the right upstream path.

**Base URL:** `https://www.sankavollerei.com/anime`

### Data Fetching Layers

1. **Server Components** → `fetchAnimeApi(path, revalidate)` — uses Next.js `fetch` cache. Never call upstream from Client Components (CSP / redirect blocking). See `lib/anime-api.ts`.
2. **Client Components (catalog)** → `/api/anime/samehadaku?resource=...` — proxies through in-memory cache+throttle (`lib/upstream-cache.ts` + `lib/upstream-queue.ts`).
3. **Client Components (streaming/batch details)** → `/api/anime/server?source=...&serverId=...` or `/api/anime/batch?source=...&batchId=...`.

**Rate limits:** Upstream 50 req/min per IP. In-memory throttle enforces max 3 concurrent, max 8 req/sec sliding window. Proxy responses include `X-Upstream-Cache: hit|stale|miss`.

### Route Structure

| Route | Type | Description |
|-------|------|-------------|
| `/` | SSR | Samehadaku homepage (4 API calls: home, schedule, popular, ongoing) |
| `/popular` | SSR+CSR | Popular anime with client-side pagination |
| `/batch` | SSR+CSR | Batch download listing |
| `/search?q=` | SSR+CSR | Samehadaku search |
| `/login?next=` | SSR | Login/register (scrypt auth, sesi cookie) |
| `/anime/[slug]` | SSR | Anime detail + episode list |
| `/anime/episode/[slug]` | SSR | Video player + download |
| `/anime/batch/[slug]` | CSR | Batch download links |
| `/history` | SSR | Per-anime watch history (auth required) |
| `/history/episodes` | SSR | Episode timeline (auth required) |
| `/otakudesu/...` | SSR | Mirrors Samehadaku routes with Otakudesu provider |
| `/api/auth/*` | API | register, login, logout, me |
| `/api/watch` | API | POST/GET watch history |
| `/api/anime/*` | API | Proxy routes for samehadaku, server, batch |

### Auth System
- Email/password login using scrypt (16-byte salt, 64-byte key).
- Session stored as `sha256(token_hash)` in Neon PostgreSQL `sessions` table.
- Cookie `anistream_session` (httpOnly, sameSite=lax, secure in production) — 36500-day expiry.
- Rate limiting: 20 attempts/IP per 15min, 8 attempts/account per 15min (`lib/auth-rate-limit.ts`).

### Key Libraries

| File | Purpose |
|------|---------|
| `lib/anime-api.ts` | Server-side fetch wrapper with revalidation |
| `lib/upstream-cache.ts` | Dedup + cache + stale-while-revalidate |
| `lib/upstream-queue.ts` | Concurrent + rate throttle (3 concurrent, 8 req/sec) |
| `lib/auth-core.ts` | scrypt hashing, email/password validation |
| `lib/auth.ts` | Session management (cookie-based) |
| `lib/db.ts` | Neon PostgreSQL with auto-schema migration |
| `lib/navigation.ts` | Open redirect prevention via `normalizeNextPath()` |
| `lib/player-progress.ts` | postMessage progress normalization |
| `lib/watch-history.ts` | Record/query watch history |
| `lib/history.ts` | Source normalization for history |

### Design System
CSS custom properties in `app/globals.css` ("Anime Aesthetic Bold" palette). Uses Tailwind 4 with `@tailwindcss/postcss`. Key tokens:
- `--primary: #ff2d7b`, `--secondary: #7c3aed`, `--accent: #06d6a0`
- `--bg-deep: #07070d`, `--bg-surface: #0e0e1a`, `--bg-elevated: #16162a`
- Glass morphism via `.glass` class with `backdrop-filter: blur(20px)`

### Key Constraints
- **Never construct `serverId` or `batchId` manually** — must come from API response data.
- **Do not use `sandbox` on streaming iframes** — Otakudesu providers like Desustream refuse to play in sandboxed iframes.
- **Security headers** centralized in `next.config.ts` — when adding new external domains for images, media, frames, or connect-src, update the CSP there.
- **Route convention:** `app/[slug]/page.tsx` is a catch-all that redirects old-format URLs to `/anime/[slug]`. Don't remove it.
- **Mobile fullscreen:** controlled through `MobileFullscreenPlayer` with orientation lock; double-tap does not exit fullscreen.

### Testing Quirks
- Tests read source files with `readFileSync` + regex assertions (see `tests/production-readiness.test.ts`, `tests/media-hardening.test.ts`). Changing code structure or imports may break these.
- `tests/upstream-rate-limit.test.ts` calls `resetUpstreamCacheForTesting()` and `resetThrottleForTesting()` — these reset module-level state.

### Deployment
- Vercel, region forced to `sin1` (Singapore) via `vercel.json`.
- `DATABASE_URL` env var required for auth and watch history.
- `NEXT_PUBLIC_SITE_URL` env var for sitemap/robots (defaults to `https://ani-stream-chi.vercel.app`).
