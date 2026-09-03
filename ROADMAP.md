# Dashboard — Roadmap

Derived from GOAL.md. Rebuilt when GOAL changes or an epic ships.

## Current epic

None. E2 (below) shipped the same run it was filed — see `## Shipped`.
Next `research` run should look for the next candidate; the most obvious
lead is Phase 2 of E2 (per-app adoption of `agile-toolkit:activeTeam`), but
that's each consumer app's own epic, filed in that app's own repo when it's
next picked — not this one.

## Next epics

None queued in this repo. Phase 2 of E2 (per-app adoption of
`agile-toolkit:activeTeam` — Scrum Facilitator, Planning Poker, Moving
Motivators and others prefilling their own team-name field from it instead
of asking again) belongs in each consumer app's own repo, filed when that
repo is next picked, per the one-repo-per-run rule.

## Polish backlog

Small items, no issues filed. Cleared in batches (§ Batch polish).
- Design system adoption (header/theme/card primitives) is tracked per-app in
  each app's own repo, not here — the Dashboard's own job is just to keep
  `design-system/` correct and each app's local `src/tokens.css` copy in
  sync when tokens change.

## Shipped

Versioning was not tracked per-feature before the 2026-07-25 GOAL/ROADMAP
pass — the package stayed at `0.1.0` throughout that period. Everything
below is already live in `main`:
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

**v0.2.0 — E1: Reader completeness** (2026-09-01):
- ~~[#31](https://github.com/agile-toolkit/agile-toolkit.github.io/issues/31) —
  attention badge on cards for at-risk app state~~
- ~~[#32](https://github.com/agile-toolkit/agile-toolkit.github.io/issues/32) —
  Moving Motivators team/PIN session data surfaced on the card~~
- ~~[#33](https://github.com/agile-toolkit/agile-toolkit.github.io/issues/33) —
  Sprint Metrics `lastSprintGoal` chip~~

**v0.3.0 — [E2: Shared team identity primitive](https://github.com/agile-toolkit/agile-toolkit.github.io/issues/41)**
(2026-09-01) — filed and shipped the same run, against the new suite
platform GOAL:
- ~~`agile-toolkit:activeTeam` contract (`src/team.ts`) — written by
  whichever app last set a team name, starting with the Dashboard itself
  seeding it from Team Identity's `teamName` on every scan~~
- ~~`TeamPill` in the nav bar surfaces the active team name suite-wide,
  not just inside the Team Identity card~~
- ~~Contract + component copied into `design-system/` with a catalog entry,
  so other apps can adopt reading — or writing — it as their own future
  epic (Phase 2, filed per-repo, not here)~~

**v0.3.5 — Fix factually wrong app-card descriptions** (2026-09-02) — found via a suite-wide UX/scope audit:
- ~~`apps.ts`'s `sprint_metrics` card wrongly described it as "a Chrome
  extension for Jira"; `change_planner`'s wrongly cited "the PDCA cycle"
  instead of Jurgen Appelo's 4-facet framework — rewrote all 10 card
  descriptions to match each app's actual README~~
- ~~"N tools" stat now derives from `APPS.length` instead of a hardcoded
  `10`~~
- ~~Wrapped `ExportImport.tsx`'s "Data Management" block in a
  `<section aria-label>` landmark, clearing the 2026-09-01 visual-audit
  polish item~~

**v0.3.6 — Per-app accent card borders; theme-aware hero banner** (2026-09-03) — a user directly flagged both:
- ~~Cards with no usage data yet had a structurally different, plain gray
  border instead of just a different top-border color — replaced with the
  suite's own per-app `data-accent` contract, so every card always has a
  colored top border matching its actual sibling app, decoupled from the
  live/active status badge~~
- ~~Hero banner's hardcoded dark navy gradient looked like a stray dark box
  on light theme — added a theme-aware `--hero-gradient` token (cobalt
  brand gradient for light, original navy kept for dark)~~
