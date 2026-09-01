# Changelog

## Unreleased

- docs: refresh `GOAL.md` from the suite-wide `GOALS.md` platform thesis
  (shared team object, revenue paths, per-app platform roles) and rebuild
  `ROADMAP.md` around it. Filed E2 (shared team identity primitive) as the
  next epic — no code shipped yet, implementation starts next run.

## 0.2.0 — E1: Reader completeness (2026-09-01)

- feat: Sprint Metrics `lastSprintGoal` chip on the Dashboard card (E1 #33).
  `readSprintMetrics()` now reads the `lastSprintGoal` field `writeLastSession()`
  in `sprint-metrics/src/App.tsx` already writes but the reader previously
  dropped, and shows it as a truncated `goal` chip right after the project
  name — mirroring the `top.goal` chip pattern in `readChangePlanner()`.
- fix: accessibility — the "Data Management" footer label and caption used
  raw Tailwind `text-slate-400 dark:text-gray-500` instead of a design-system
  token, failing WCAG AA color contrast (2.45:1 light / 4.16:1 dark against a
  4.5:1 minimum). Replaced all 14 occurrences of that literal pattern across
  the app with the `--fg-3` token (`text-[color:var(--fg-3)]`), which passes
  contrast in both themes and tracks the theme automatically. Also gave the
  footer GitHub link a permanent underline — it previously relied on color
  alone plus a hover-only underline to distinguish it from surrounding text
  (1.08:1 contrast against the caption color), failing `link-in-text-block`.
  Found by this release's visual/a11y audit (new `tools/visual-audit.mjs` —
  Playwright screenshots across 3 viewports × 2 themes + an `axe-core` scan
  per screen); a remaining moderate `region`/landmarks finding is deferred to
  the polish backlog since it isn't a contrast, labeling, or keyboard issue.
- feat: Dashboard reader for Moving Motivators now surfaces team/PIN session
  data (E1 #32). `readMovingMotivators()` previously returned `null` for any
  team that had only run live workshop sessions, since those write to
  `moving-motivators:motivationSnapshot` / `:teamSessionHistory` rather than
  the solo `:lastSession` key. It now reads both sources and — mirroring the
  "newer wins" pattern already used for `readTeamIdentity()` — prefers
  whichever has the more recent timestamp, showing top-3 motivators plus a
  participant-count chip for team sessions.
- feat: attention badge on cards for at-risk app state (E1 #31). Change
  Planner cards now flag when there's an overdue open action; Kanban Designer
  cards flag when any column is over its WIP limit. New `Badge` variant
  `'attention'` (red pill, static dot, i18n key `card.attention` in
  EN/ES/BE/RU) — badge priority is `live` > `attention` > `active`. Synced
  the same variant into `design-system/components/Badge.tsx` and its catalog
  entry in `components.md`.
- docs: define `GOAL.md` and `ROADMAP.md`; fill in README with dev commands,
  localStorage keys, and tech notes; add this changelog. No behavior change —
  this app already had all the functionality described in these docs, it
  just wasn't written down anywhere agent-owned before now.
- docs: move `GOAL.md` and `ROADMAP.md` from `.artefacts/` to the repo root.
