# Dashboard — Roadmap

Derived from GOAL.md. Rebuilt when GOAL changes or an epic ships.

## Current epic

None — idle. See `## Next epics` below for the next candidate.

## Next epics

1. **E1: Reader completeness** — serves #1, #5. Three open, self-contained
   reader/UX gaps already scoped in issues, none implemented yet:
   - [#31](https://github.com/agile-toolkit/agile-toolkit.github.io/issues/31) —
     attention badge on cards for at-risk app state (Change Planner overdue
     actions, Kanban Designer over-WIP columns)
   - [#32](https://github.com/agile-toolkit/agile-toolkit.github.io/issues/32) —
     Moving Motivators team/PIN session data is invisible to the Dashboard
     reader today (only solo sessions are read)
   - [#33](https://github.com/agile-toolkit/agile-toolkit.github.io/issues/33) —
     Sprint Metrics `lastSprintGoal` field is written but never surfaced as a
     chip
   All three are `needs-review`, past the 7-day staleness threshold — next
   `research` run should auto-approve and adopt this as `current_epic`.

## Polish backlog

Small items, no issues filed. Cleared in batches (§ Batch polish).
- `README.md` had no real content before this run (fixed alongside this
  GOAL/ROADMAP pass).
- Design system adoption (header/theme/card primitives) is tracked per-app in
  each app's own repo, not here — the Dashboard's own job is just to keep
  `design-system/` correct and each app's local `src/tokens.css` copy in
  sync when tokens change.

## Shipped

Versioning was not tracked per-feature before this GOAL/ROADMAP pass — the
package has stayed at `0.1.0` throughout. Everything below is already live in
`main`:
- ~~App card grid — 10 cards with live `localStorage` preview per app, CTA
  link, active/live badge states~~
- ~~Readers for all 10 suite apps, each preferring a dedicated
  `<app>:lastSession` summary key with legacy/raw-array fallback~~
- ~~Auto-refresh (5s poll + `storage` event listener)~~
- ~~Design system: `tokens.css`, `AppCard`, `Badge`, `MemberAvatars`,
  `MiniBarChart`, `MiniKanban`, `ProgressBar`, `StatChipRow`, `AppHeader`,
  `LanguagePicker`, `ThemeToggle`~~
- ~~i18n — EN/ES/BE/RU via react-i18next, full UI including all app titles~~
- ~~Light/dark theme via `data-theme` attribute + anti-flash script~~
- ~~Export/Import v2 — `_meta` envelope, prefix-based key ownership (no
  hardcoded key list), import preview/confirm step~~
- ~~Workspace management — save/switch/rename/delete named workspaces
  (`agile-toolkit:workspaces`, `agile-toolkit:activeWorkspace`)~~
- ~~Sort by recency — active apps bubble to top, sorted by session timestamp~~
- ~~Richer readers: Change Planner (facet coverage dots, overdue count),
  Planning Poker, Improvement Board, Team Identity (live-draft detection),
  Scrum Facilitator (participant/retro-note chips), Sprint Metrics (mood
  emoji)~~
