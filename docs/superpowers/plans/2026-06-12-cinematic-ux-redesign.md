# AniStream Cinematic UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the selected Cinematic Focus redesign across AniStream's primary user experience.

**Architecture:** Keep the existing Next.js App Router and API contracts. Add small shared navigation and shelf components, rebuild the home composition around existing server-provided data, and consolidate the visual system in global CSS.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Lucide React, Node test runner.

---

### Task 1: Lock UX requirements with regression tests

**Files:**
- Create: `tests/cinematic-ux.test.ts`

- [ ] Add source-level tests for navigation, accessibility, hero controls, history shelf, and shared cards.
- [ ] Run the test and confirm it fails before implementation.

### Task 2: Rebuild the global shell

**Files:**
- Modify: `app/layout.tsx`
- Modify: `components/NavbarLinks.tsx`
- Modify: `components/NavbarSearch.tsx`
- Modify: `components/SourceSwitcher.tsx`
- Modify: `components/AuthMenu.tsx`
- Create: `components/MobileDock.tsx`

- [ ] Implement the compact desktop header and accessible mobile dock.
- [ ] Replace handwritten shell icons with Lucide icons.

### Task 3: Rebuild the home experience

**Files:**
- Modify: `components/pages/HomePageClient.tsx`
- Create: `components/ContinueWatchingShelf.tsx`
- Modify: `components/common/AnimeCard.tsx`

- [ ] Implement the Cinematic Focus hero and controls.
- [ ] Add the history-backed Continue Watching shelf.
- [ ] Convert schedule and catalogs to dense, consistent sections.

### Task 4: Apply the shared design system

**Files:**
- Modify: `app/globals.css`
- Modify: `components/LoginPanel.tsx`
- Modify: `app/login/page.tsx`
- Modify: `app/history/page.tsx`
- Modify: `app/history/episodes/page.tsx`

- [ ] Consolidate tokens, focus states, motion preferences, cards, buttons, and surfaces.
- [ ] Align account and history flows with the selected visual system.

### Task 5: Verify and document

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `WORKFLOW.md`
- Create: `design-qa.md`

- [ ] Run tests, lint, and production build.
- [ ] Capture desktop and mobile screenshots and compare against the selected visual target.
- [ ] Fix P0-P2 visual or behavioral findings before handoff.
