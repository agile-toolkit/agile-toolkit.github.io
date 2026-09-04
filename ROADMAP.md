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

**v0.4.1 — Fix Work Profiles hub icon; backport 4 icons from Scrum Facilitator** (2026-09-04) — user directly flagged the icon:
- ~~Replaced Work Profiles' `PersonIcon` (generic, indistinguishable from
  Team Identity's icon on the same accent) with a new `MedalIcon` fitting
  the app's own "recognized contributions... over job titles" framing~~
- ~~Backported `ClapperboardIcon`/`StopwatchIcon`/`PlayIcon`/`PauseIcon`
  from Scrum Facilitator's own emoji-sweep run into the shared
  `icons.tsx` so other apps can reuse them~~

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

**v0.3.11 — Redesign Team Identity icon; add new shared icons** (2026-09-03) — user directly flagged the icon still wasn't right, plus asked for the emoji sweep to continue and Facilitator Mode to persist across apps:
- ~~Replaced `TeamIcon` (too similar to Work Profiles' person icon) with
  a new `IdentityCardIcon` specific to Team Identity~~
- ~~Added 10 new SVG icons for the next round of the emoji sweep
  (Planning Poker, Scrum Facilitator), each visually verified before use~~
- ~~Documented `useFacilitatorMode`'s storage key as shared
  (`agile-toolkit:facilitatorMode`) across every app instead of
  app-prefixed, so the mode survives switching apps~~

**v0.3.10 — Fix broken and irrelevant hub tile icons** (2026-09-03) — user directly flagged both:
- ~~`HandshakeIcon` (Team Identity) had broken path geometry, rendered as
  a garbled shape — removed and replaced with a new `TeamIcon`~~
- ~~`PinIcon` (Improvement Board) didn't represent the app's purpose —
  replaced with a new `TrendUpIcon`~~

**v0.3.9 — Replace hub tile emoji with colored SVG icons** (2026-09-03) — first installment of a suite-wide emoji→SVG sweep the user asked for:
- ~~Shared `icons.tsx` (generic UI-chrome) + `app-icons.tsx` (Dashboard
  hub tiles) added to `design-system/`; the 10 app-tile emoji in
  `apps.ts` replaced with colored components tied to each app's
  `--app-accent` token~~

**v0.3.8 — Hide app-card descriptions in Facilitator Mode** (2026-09-03) — a direct user follow-up:
- ~~`AppCard`'s description paragraph now hides while presenting, kept as
  a spacer so card footers stay aligned across the grid~~

**v0.3.7 — Facilitator Mode** (2026-09-03) — a user directly asked for it suite-wide:
- ~~Promoted Team Identity's Facilitator Mode into a shared design-system
  pattern (`useFacilitatorMode.ts` + `FacilitatorToggle.tsx`,
  `AppHeader`'s `hideLanguagePicker` promoted to canonical) and adopted it
  on the Dashboard itself — bigger UI, hidden secondary chrome (language
  picker, workspace manager, export/import, footer), toggled from the
  header. First of an 11-repo rollout.~~

**v0.3.6 — Per-app accent card borders; theme-aware hero banner** (2026-09-03) — a user directly flagged both:
- ~~Cards with no usage data yet had a structurally different, plain gray
  border instead of just a different top-border color — replaced with the
  suite's own per-app `data-accent` contract, so every card always has a
  colored top border matching its actual sibling app, decoupled from the
  live/active status badge~~
- ~~Hero banner's hardcoded dark navy gradient looked like a stray dark box
  on light theme — added a theme-aware `--hero-gradient` token (cobalt
  brand gradient for light, original navy kept for dark)~~
