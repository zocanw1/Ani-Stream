# AniStream Cinematic UX Redesign

## Goal

Redesign AniStream around the selected Cinematic Focus concept while preserving every existing route, anime source, authentication flow, history feature, and player behavior.

## Experience

- A compact global header keeps search, source selection, navigation, history, and account actions available without dominating the screen.
- The home page opens with an immersive featured anime, clear metadata, a short description, and working Watch and Detail actions.
- Continue Watching appears directly after the hero when history exists and falls back to a useful history prompt when signed out or empty.
- The weekly schedule becomes a horizontal, scan-friendly strip.
- Trending, recent episodes, movies, and ongoing titles use a consistent dense catalog system.
- Mobile receives a stable bottom navigation dock, touch-sized controls, and layouts that do not depend on hover.

## Visual System

- Near-black canvas, charcoal surfaces, neutral text, and restrained AniStream red accents.
- Maximum 8px component radius except circular icon controls and media masks.
- Inter is not introduced; the existing Geist and Nunito setup remains the typography source.
- Posters and API-provided artwork remain the primary visual assets.
- Elevation is subtle and reserved for menus, player surfaces, and active media.

## Accessibility

- Skip navigation link, visible keyboard focus, labeled icon controls, reduced-motion support, and adequate touch targets.
- Hero rotation can be paused and carousel controls expose their selected state.
- Empty, loading, and failure states remain actionable.

## Measurement

No behavioral analytics source is connected, so launch measurement is defined as an instrumentation-ready framework rather than claimed user data.

- Primary: home-to-watch completion rate.
- Drivers: search submit rate, detail-to-watch rate, Continue Watching usage, schedule item opens.
- Guardrails: player error rate, route error rate, mobile layout regressions, accessibility violations.

## Scope

The implementation updates the global shell, home page, shared cards, authentication surfaces, history surfaces, and shared visual tokens. Existing data contracts and backend behavior remain unchanged.
