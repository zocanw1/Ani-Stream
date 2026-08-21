# AniStream — Agent Instructions

## Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run test` | Run **all** tests (`tsx --test tests/**/*.test.ts`) |

There is no way to run a single test file. Tests use Node's built-in `node:test` + `assert/strict`.

## Architecture

**Two data providers**: Samehadaku (default homepage) and Otakudesu. They are **not interchangeable** — endpoint prefixes, IDs, and response shapes differ. `fetchAnimeApi()` and proxy routes use `source=samehadaku` / `source=otakudesu` to select the right upstream path.

**Data fetching rules** (see `WORKFLOW.md` for the full contract):
- Server Components → `fetchAnimeApi(path, revalidate)` — uses Next.js `fetch` cache. Never call upstream from Client Components (CSP / redirect blocking).
- Client Components needing data → `/api/anime/samehadaku?resource=...` (catalog), `/api/anime/server?source=...&serverId=...` (streaming), `/api/anime/batch?source=...&batchId=...` (downloads). These proxy through an in-memory cache+throttle (`lib/upstream-cache.ts`).
- **Upstream rate limit**: 50 req/min per IP (all Vercel traffic shares one IP). The in-memory cache+throttle enforces max 3 concurrent, max 8 req/sec sliding window. Proxy responses include `X-Upstream-Cache: hit|stale|miss`.

**API routes**:
- `app/api/auth/` — register, login, logout, me (scrypt, session cookies, DB rate limiting)
- `app/api/watch/` — POST/GET watch history (requires auth, PostgreSQL via Neon)
- `app/api/anime/samehadaku/` — catalog proxy
- `app/api/anime/server/` — streaming server proxy
- `app/api/anime/batch/` — batch download proxy

**Key lib files**:
- `lib/anime-api.ts` — `fetchAnimeApi()` for Server Components
- `lib/upstream-cache.ts` — dedup + cache + stale-while-revalidate for proxy routes
- `lib/upstream-queue.ts` — concurrent + rate throttle for upstream requests
- `lib/auth-core.ts` — scrypt hashing, email/password validation
- `lib/auth.ts` — session management (cookie `anistream_session`)
- `lib/db.ts` — Neon PostgreSQL client with auto-schema migration
- `lib/navigation.ts` — `normalizeNextPath()` to prevent open redirects

## Key constraints

- **Do not use `sandbox` on streaming iframes** — Otakudesu providers like Desustream refuse to play in sandboxed iframes.
- **Never construct `serverId` or `batchId` manually** — must come from API response data.
- **Security headers** are centralized in `next.config.ts` — when adding a new external domain for images, media, frames, or connect-src, update the CSP there.
- **Route conventions**: `app/[slug]/page.tsx` is a catch-all that redirects old-format URLs to `/anime/[slug]`. Don't remove it.
- **Mobile fullscreen**: controlled through `MobileFullscreenPlayer` with orientation lock; double-tap does not exit fullscreen.
- **Design system**: CSS custom properties in `app/globals.css` (Anime Aesthetic Bold palette). Uses Tailwind 4 with `@tailwindcss/postcss`.

## Testing quirks

- Tests read source files with `readFileSync` + regex assertions (see `tests/production-readiness.test.ts`, `tests/media-hardening.test.ts`). Changing code structure or imports may break these.
- `tests/upstream-rate-limit.test.ts` calls `resetUpstreamCacheForTesting()` and `resetThrottleForTesting()` — these reset module-level state.

## Deployment

- Vercel, region forced to `sin1` (Singapore) via `vercel.json`.
- `DATABASE_URL` env var required for auth and watch history.
- `NEXT_PUBLIC_SITE_URL` env var for sitemap/robots (defaults to `https://ani-stream-chi.vercel.app`).
