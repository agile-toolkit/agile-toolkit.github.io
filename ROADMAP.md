# Dashboard — Roadmap

Derived from GOAL.md. Rebuilt when GOAL changes or an epic ships.

## Current epic

**[E2: Shared team identity primitive](https://github.com/agile-toolkit/agile-toolkit.github.io/issues/41)**
— serves the platform thesis directly
("a shared team object... written once and readable everywhere") and the
Dashboard's stated role ("owns the workspace primitive that everything else
syncs around"). Filed after GOAL.md was refreshed to the new suite platform
thesis (2026-09-01).

**Problem, grounded in the current code:** every app that needs a team name
asks for its own, separately, and none of them share it:
- `team-identity:lastSession.teamName` (`readTeamIdentity()` already reads
  it for the card, but only for display)
- `scrum-facilitator-team-name` (its own standalone key)
- Moving Motivators' team sessions carry their own `teamName` per session
- Planning Poker, Sprint Metrics, Improvement Board, Kanban Designer,
  Work Profiles, Change Planner, Salary Formula have no team-name concept
  today, or store one locally with no cross-app link

A visitor who names their team in Team Identity gets asked to name it again
in every other tool. That's the opposite of "written once, readable
everywhere," and it's the concrete, observable form of the missing platform
layer the new GOAL calls out.

**Phase 1 (this epic, this repo):** the Dashboard defines and owns the
contract, alongside the existing `agile-toolkit:activeWorkspace` /
`agile-toolkit:workspaces` primitive it already maintains:
- Add `agile-toolkit:activeTeam` — `{ name: string, source: string,
  updatedAt: number }` — written by whichever app the user last set a team
  name in (starting with Team Identity, since it's the canonical "produces
  the team object" app per GOAL), read by the Dashboard.
- Dashboard surfaces the active team name in its own header/workspace area
  (not just inside the Team Identity card) so it visibly becomes a
  suite-wide fact, not an app-local one.
- Document the contract in `README.md` `## localStorage keys` and in
  `design-system/components.md` (or a new `design-system/contracts.md` if
  the pattern is going to recur) so other apps' agents know the key exists
  and its shape before they start reading or writing it.

**Phase 2+ (future epics, filed in the consumer/producer repos when picked):**
Team Identity writes `agile-toolkit:activeTeam` on save; Scrum Facilitator,
Planning Poker, Moving Motivators and others prefill their own team-name
field from it instead of asking again. Out of scope for this epic — each of
those is a separate repo's own epic, filed and implemented when that repo is
next picked, per the one-repo-per-run rule.

**Why Dashboard goes first:** the Dashboard already owns the one existing
cross-app primitive (`agile-toolkit:workspaces`), already reads every app's
`teamName`-shaped field for its cards, and is the only place a visitor sees
all ten tools at once — it's the natural place to define the contract before
asking nine other repos to adopt it.

## Next epics

None queued beyond E2 above. Phase 2 epics (per-app adoption of
`agile-toolkit:activeTeam`) get filed in each consumer app's own repo, not
here, once Phase 1 ships and the contract is stable.

## Polish backlog

Small items, no issues filed. Cleared in batches (§ Batch polish).
- `region` a11y finding from the 2026-09-01 visual audit: "Data Management"
  footer content isn't contained by a landmark region on any viewport/theme
  (moderate impact, not contrast/keyboard/labeling — doesn't block this
  release). Wrap the footer `Data Management` block in a `<section>` or
  `aria-label`ed landmark.
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
