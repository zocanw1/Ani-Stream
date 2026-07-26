---
name: run-frontend-design
description: "Run visual design audit, overhaul pages, and screenshot AniStream for UI/UX review"
---

# run-frontend-design — AniStream Visual Design Skill

Drive the AniStream Next.js app (http://localhost:3001), take retina screenshots of every page, and apply full-page design overhauls using the premium design system.

## Driver

[`.claude/skills/run-frontend-design/driver.mjs`](.claude/skills/run-frontend-design/driver.mjs) — Playwright script that:

- Captures 30+ screenshots (11 pages × 3 viewports + interactions)
- Saves to `screenshots/` as `{label}__{viewport}.png`
- Writes `screenshots/manifest.json`
- Supports `--page /path` for single-page capture, `--diff` for comparison

## Prerequisites

```bash
# Installed already — these are for reference
npm install --save-dev playwright
npx playwright install chromium
```

## Build & Launch

```bash
npm run dev
# Dev server at http://localhost:3001
```

## Run (Agent Path) — Screenshot Audit

```bash
# Full audit (all pages × desktop/tablet/mobile)
node .claude/skills/run-frontend-design/driver.mjs

# Single page
node .claude/skills/run-frontend-design/driver.mjs --page /login

# Single viewport
APP_URL=http://localhost:3001 node .claude/skills/run-frontend-design/driver.mjs
```

## Run (Human Path)

```bash
npm run dev    # → http://localhost:3001
npm run build  # production build
npm run test   # run tests
```

## Design System

Global CSS variables in `app/globals.css`:

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#ff2d7b` | Hot pink accent, CTAs, badge fills |
| `--secondary` | `#7c3aed` | Purple accent, episode tags, hover glows |
| `--accent` | `#06d6a0` | Teal for ongoing badges, success states |
| `--gold` | `#fbbf24` | Score/rating stars |
| `--bg-deep` | `#07070d` | Near-black background |
| `--bg-glass` | `rgba(14,14,26,0.78)` | Glass morphism cards |
| `--shadow-glow` | `0 0 30px var(--primary-glow)` | Premium glow shadow |

Premium utility classes:
- `.glass` / `.glass-strong` — backdrop-blur panels
- `.glow-card` / `.glow-card-premium` — hover-lift cards with gradient border
- `.btn-primary` / `.btn-glow` — gradient buttons with pulse animation
- `.text-gradient-anime` — animated gradient text
- `.section-title` — pill-accent heading with glow
- `.hover-glow` / `.hover-lift` — hover effects
- `.bg-grid` / `.bg-grid-dense` — grid pattern backgrounds
- `.gradient-border` — animated gradient border edge

## Gotchas

- **Port 3000 may be in use.** The dev server auto-selects 3001 — set `APP_URL` to match.
- **Retina screenshots.** Driver uses `deviceScaleFactor: 2` for crisp captures — files are 2× pixel size.
- **Network idle may timeout.** Pages with watch-history polling won't reach `networkidle`; driver catches gracefully.
- **Tailwind 4 + CSS vars.** All colors use CSS custom properties — no Tailwind `theme()` references.
- **Screenshots require dev server running.** Always start `npm run dev` first.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Cannot find module 'playwright'` | Run `npm install --save-dev playwright` |
| `Browser not found` | Run `npx playwright install chromium` |
| Blank screenshots | Verify `APP_URL` matches dev server (default: 3001) |
| Timeout loading page | API data may be slow — try `--viewport desktop` only |
