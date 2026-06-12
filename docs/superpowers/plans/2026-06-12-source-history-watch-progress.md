# Source History and Watch Progress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate Samehadaku and Otakudesu history for one account while saving an episode immediately and showing playback progress only when an iframe provider reports a real position.

**Architecture:** Keep one PostgreSQL history store and filter it by the existing `source` column. Add nullable player-progress columns, validate provider messages in a pure helper, let the player emit validated progress events, and let `WatchRecorder` persist initial history plus throttled real progress without estimating time from page duration.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Neon PostgreSQL, Node test runner via `tsx`.

---

### Task 1: Define source and progress behavior

**Files:**
- Create: `lib/player-progress.ts`
- Modify: `lib/history.ts`
- Test: `tests/history.test.ts`

- [ ] **Step 1: Write failing tests**

Add tests that require:

```ts
normalizeHistorySource("samehadaku") === "samehadaku"
normalizeHistorySource("otakudesu") === "otakudesu"
normalizeHistorySource("invalid") === "all"
historyAnimeKey({ source: "samehadaku", anime_slug: "one-piece" }) !==
  historyAnimeKey({ source: "otakudesu", anime_slug: "one-piece" })
normalizePlayerProgress({ currentTime: 120, duration: 600 })
```

The normalized progress must report 120 seconds, 600 seconds, 20 percent, and source `player`. Invalid, negative, or string-only values must return `null`; completion must only come from an explicit player completion signal.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm test -- --test-name-pattern="history source|player progress"`

Expected: FAIL because the normalization helpers do not exist.

- [ ] **Step 3: Implement minimal pure helpers**

Create:

```ts
export type HistorySource = "all" | "samehadaku" | "otakudesu";
export function normalizeHistorySource(value: unknown): HistorySource;
export function historyAnimeKey(item: { source: string; anime_slug: string }): string;
export function normalizePlayerProgress(data: unknown): PlayerProgress | null;
```

Support common provider payload shapes such as `currentTime`, `position`, nested `data`, `duration`, and explicit `ended`/`completed`. Do not derive playback position from elapsed page time.

- [ ] **Step 4: Run the focused tests**

Run: `npm test -- --test-name-pattern="history source|player progress"`

Expected: PASS.

### Task 2: Add idempotent progress storage

**Files:**
- Modify: `database/schema.sql`
- Modify: `lib/db.ts`
- Modify: `lib/watch-history.ts`
- Test: `tests/history.test.ts`

- [ ] **Step 1: Write failing schema and payload tests**

Require both history tables to contain:

```sql
watched_seconds DOUBLE PRECISION
duration_seconds DOUBLE PRECISION
progress_percent DOUBLE PRECISION
progress_source TEXT
is_completed BOOLEAN NOT NULL DEFAULT FALSE
last_watched_at TIMESTAMPTZ
```

Require `normalizeWatchPayload()` to preserve a valid player-progress object and discard invalid progress.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm test -- --test-name-pattern="history schema|watch payload"`

Expected: FAIL because progress columns and payload fields are missing.

- [ ] **Step 3: Implement schema migration and persistence**

Add the columns to table creation and idempotent `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements in `ensureDatabase()`. Extend both UPSERT queries so metadata is always saved, while player progress is updated only when the incoming `last_watched_at` is not older than the stored progress timestamp.

Do not require progress to save an episode. Keep progress nullable for providers that do not report it.

- [ ] **Step 4: Filter history queries by source**

Change:

```ts
getLastWatchHistory(userId, source = "all")
getEpisodeHistory(userId, limit = 100, source = "all")
getAnimeHistory(userId, limit = 100, source = "all")
```

Use parameterized SQL branches for provider-specific filtering. Group anime with `DISTINCT ON (source, anime_slug)`.

- [ ] **Step 5: Run focused tests**

Run: `npm test -- --test-name-pattern="history schema|watch payload|history source"`

Expected: PASS.

### Task 3: Capture only real iframe progress

**Files:**
- Modify: `components/MobileFullscreenPlayer.tsx`
- Modify: `components/WatchRecorder.tsx`
- Modify: `app/anime/episode/[slug]/EpisodeDetailClient.tsx`
- Modify: `app/otakudesu/episode/[slug]/OtakudesuEpisodeClient.tsx`
- Test: `tests/media-hardening.test.ts`

- [ ] **Step 1: Write failing player integration tests**

Require:

```tsx
iframeRef.current?.contentWindow === event.source
event.origin === new URL(src).origin
normalizePlayerProgress(event.data)
window.dispatchEvent(new CustomEvent("anistream:player-progress", ...))
```

Require `WatchRecorder` to send the initial history immediately, listen for the custom progress event, throttle normal progress writes, and flush the latest real progress on `visibilitychange` or `pagehide`. It must not use intervals to estimate seconds.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `npm test -- --test-name-pattern="real iframe progress"`

Expected: FAIL because the player does not emit progress.

- [ ] **Step 3: Implement validated player events**

Give the iframe a ref. Accept messages only when both `event.source` and `event.origin` match the active iframe. Normalize the payload with `normalizePlayerProgress()` and emit a custom event containing the player `src` and normalized progress.

- [ ] **Step 4: Implement recorder persistence**

Pass the current streaming URL into `WatchRecorder`. Send initial metadata with `keepalive: true`, then persist only custom events whose `src` matches the current player. Use `navigator.sendBeacon` for the final flush where available.

- [ ] **Step 5: Run focused tests**

Run: `npm test -- --test-name-pattern="real iframe progress|streaming frames"`

Expected: PASS.

### Task 4: Add provider tabs and accurate progress UI

**Files:**
- Modify: `app/history/page.tsx`
- Modify: `app/history/episodes/page.tsx`
- Modify: `lib/history.ts`
- Test: `tests/netflix-layout.test.ts`

- [ ] **Step 1: Write failing page tests**

Require both pages to:

```tsx
await searchParams
normalizeHistorySource(...)
source=samehadaku
source=otakudesu
```

Require progress markup to render only when `progress_source === "player"` and `progress_percent` is not null.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `npm test -- --test-name-pattern="provider history tabs"`

Expected: FAIL because provider tabs are absent.

- [ ] **Step 3: Implement source-aware server pages**

Read `searchParams` asynchronously, normalize `source`, pass it into database queries, preserve the source when switching between per-anime and per-episode pages, and render All/Samehadaku/Otakudesu tabs.

- [ ] **Step 4: Add truthful progress display**

Render the progress bar and percentage only for real player data. Keep old history and unsupported providers visible without fabricated minutes or percentages.

- [ ] **Step 5: Run focused tests**

Run: `npm test -- --test-name-pattern="provider history tabs|Netflix-style"`

Expected: PASS.

### Task 5: Document, migrate, verify, and deploy

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/superpowers/plans/2026-06-12-source-history-watch-progress.md`

- [ ] **Step 1: Update changelog**

Document provider-separated history, immediate episode recording, nullable real player progress, and the absence of elapsed-page-time estimates.

- [ ] **Step 2: Run full verification**

Run:

```powershell
npm test
npm run lint
npm run build
```

Expected: all tests pass, lint exits 0, and Next.js production build exits 0.

- [ ] **Step 3: Apply the idempotent live migration**

Run the same `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements against the configured Neon database, then inspect both table schemas without printing credentials.

- [ ] **Step 4: Commit and push only relevant files**

Do not stage the user's unrelated BAT-file changes.

```powershell
git add -- database/schema.sql lib/db.ts lib/history.ts lib/player-progress.ts lib/watch-history.ts components/MobileFullscreenPlayer.tsx components/WatchRecorder.tsx app/anime/episode/[slug]/EpisodeDetailClient.tsx app/otakudesu/episode/[slug]/OtakudesuEpisodeClient.tsx app/history/page.tsx app/history/episodes/page.tsx tests/history.test.ts tests/media-hardening.test.ts tests/netflix-layout.test.ts CHANGELOG.md docs/superpowers/plans/2026-06-12-source-history-watch-progress.md
git commit -m "Add source-separated watch history progress"
git push origin main
```

- [ ] **Step 5: Verify production**

Wait for the production deployment, confirm it is Ready in `sin1`, and check:

```text
/history redirects anonymous users to login
/api/auth/me reports databaseConfigured=true
the production homepage returns 200
```

Use an authenticated browser session for visual history-tab verification if one is available.
