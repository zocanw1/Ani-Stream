# AniStream UX KPI Framework

## Initiative

Measure whether the Cinematic Focus redesign helps users find an anime and start or resume watching with less friction. No behavioral analytics source is connected, so these are implementation-ready definitions and provisional targets, not measured results.

## Primary KPI

### Home-to-watch completion rate

- Definition: unique sessions that open an episode player after visiting Home divided by unique Home sessions.
- Decision: validates whether the new hierarchy, hero CTA, schedule, and catalogs improve the core journey.
- Source needed: page-view and player-open events with anonymous session identifiers.
- Provisional target: establish a two-week baseline, then improve the rate by 10% relative without increasing player errors.

## Driver Metrics

### Detail-to-watch rate

- Definition: unique anime detail visits followed by an episode player open divided by unique anime detail visits.
- Use: detects friction in episode discovery after a user selects a title.

### Search success rate

- Definition: searches followed by an anime detail or episode open within the same session divided by submitted searches.
- Use: evaluates the global search control and search results relevance.

### Continue Watching usage

- Definition: Continue Watching clicks divided by authenticated Home sessions with available history.
- Use: measures whether returning users can resume efficiently.

### Schedule engagement

- Definition: schedule item opens divided by sessions that viewed the schedule section.
- Use: validates the scan-friendly weekly schedule.

## Guardrails

- Player error rate must not increase from baseline.
- Route error rate must remain below 1% of page views.
- Mobile horizontal page overflow must remain zero at supported widths.
- Automated accessibility checks must report no critical violations on Home, search, login, detail, and player routes.

## Event Plan

- `home_view`
- `hero_cta_click` with `anime_id` and `position`
- `search_submit` with normalized query length, never raw account data
- `anime_open` with `source`, `anime_id`, and `origin_section`
- `player_open` with `source`, `anime_id`, and `episode_id`
- `continue_watching_click`
- `schedule_item_click` with `day` and `anime_id`
- `route_error` and `player_error`

## Evidence And Gaps

The current repository and rendered UI were reviewed. No trusted product analytics warehouse, dashboard, or semantic layer was available, so actual baselines and firm targets require instrumentation and live data after release.
