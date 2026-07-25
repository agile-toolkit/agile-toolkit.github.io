# Changelog

## Unreleased

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
