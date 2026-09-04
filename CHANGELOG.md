# Changelog

## Unreleased

## 0.4.1 — Fix Work Profiles hub icon; backport 4 icons from Scrum Facilitator (2026-09-04)

- **fix**: Work Profiles' hub tile used `PersonIcon` — a generic single
  person, indistinguishable in intent from Team Identity's icon (both sit
  on the same amber accent) and not specific to what the app actually
  does (a skills/contributions record, not just "a person"). Replaced
  with a new `MedalIcon` reflecting the app's own framing — "recognized
  contributions... over job titles." Visually verified at real hub-tile
  size before shipping. User-reported.
- **chore**: backported `ClapperboardIcon`, `StopwatchIcon`, `PlayIcon`,
  `PauseIcon` — added directly to Scrum Facilitator's local `icons.tsx`
  in its own emoji-sweep run since this repo wasn't picked yet — into
  `design-system/components/icons.tsx` so other apps can reuse them
  instead of redefining locally.
- **ci**: CI Node bumped 20 → 22 and `engines` declared. `jsdom@30` requires
  Node `^22.22.2 || ^24.15.0 || >=26`, so the test step could never have passed
  on the pinned Node 20 — invisible until this release started running the
  tests in CI at all. Builds were unaffected (vite and tsc do not load jsdom).

## 0.4.0 — Workspace data-loss fixes, registry gaps, error boundary (2026-09-03)

- **fix**: switching workspaces destroyed data. `handleSwitchWorkspace` wrote
  the active *name* and nothing else — the data on screen stayed put, so
  pressing **Save** afterwards wrote the previous team's data into the workspace
  you had just switched to. Silent and unrecoverable. Switching now checkpoints
  the outgoing workspace and loads the incoming one.
- **fix**: restoring a workspace never cleared, so any app the incoming
  workspace had no entry for kept showing the outgoing team's data — team A's
  improvement board appearing in team B's workspace.
- **fix**: "New workspace" started as a copy of whatever was on screen.
- **fix**: quota failures were swallowed per key, producing a silent partial
  restore — a mixture of two teams' data, which is worse than either. A
  snapshot is a full copy of every app's data inside a ~5 MB origin budget, so
  quota is the realistic failure; it now surfaces as `WorkspaceQuotaError`.
- **fix**: `wp-sprint-capacity` (real sprint-capacity data) and
  `mm_about_dismissed` matched no prefix in `data-keys.ts`, so `claimedByApp`
  returned `null` and both were silently excluded from backup, export and every
  workspace snapshot.
- **fix**: the `activeTeam` backfill ran unconditionally on a 5s poll, silently
  reverting any team name set by another app within five seconds. Now a
  one-time seed for charters predating Team Identity writing the contract
  itself.
- **fix**: `parseBackup` threw a raw `TypeError` instead of its intended message
  on a file containing `null` or a bare array.
- **refactor**: workspace storage extracted to `src/workspaces.ts` and covered
  by 18 tests — the interesting part is what happens to megabytes of someone's
  team data, not the dropdown.
- **feat**: `ErrorBoundary` added to the design system and adopted by all 11
  apps plus this one.
- **ci**: `npm ci` instead of `npm install` (this was the only workflow
  ignoring its own lockfile), and `npm test` now gates the deploy.

## 0.3.11 — Redesign Team Identity icon; add new shared icons (2026-09-03)

- **fix**: the previous `TeamIcon` (two overlapping people) still wasn't
  right for Team Identity per the user — too similar to Work Profiles'
  single-person icon on the same amber accent, and generic "team" rather
  than "identity." Replaced with a new `IdentityCardIcon` (a person
  inside an ID-card frame), visually distinct and specific to what the
  app actually produces (a team's identity charter). `TeamIcon` moves to
  the generic `icons.tsx` library for reuse elsewhere (e.g. Planning
  Poker's team-session label).
- **feat**: added 10 new icons to `icons.tsx` — `EyeIcon`, `SunIcon`,
  `QuestionIcon`, `UploadIcon`, `DownloadIcon`, `ThumbsUpIcon`,
  `CheckboxEmptyIcon`, `CheckboxCheckedIcon`, `ShuffleIcon`, `TeamIcon` —
  covering the next round of decorative emoji flagged in Planning Poker
  and Scrum Facilitator. Every new icon was rendered and screenshotted
  standalone before being added, after the earlier broken-handshake
  incident.
- **docs**: `useFacilitatorMode`'s `storageKey` is now documented as a
  single shared key (`'agile-toolkit:facilitatorMode'`) across every
  app, not app-prefixed — user-requested, so Facilitator Mode survives
  navigating between suite apps in one tab instead of resetting per app.

## 0.3.10 — Fix broken and irrelevant hub tile icons (2026-09-03)

- **fix**: the previous release's `HandshakeIcon` (Team Identity) had
  broken path geometry and rendered as a garbled shape, not a
  handshake — user-reported. Removed it (it had no other consumers) and
  replaced the tile with a new `TeamIcon` (two overlapping people).
  Also swapped Improvement Board's `PinIcon` — a location pin doesn't
  represent capturing problems, structured dialogues, and progress
  tracking — for a new `TrendUpIcon` (upward trend line), also
  user-flagged as not relevant.

## 0.3.9 — Replace hub tile emoji with colored SVG icons (2026-09-03)

- **feat**: added a shared SVG icon library to the design-system
  (`icons.tsx` — generic UI-chrome icons; `app-icons.tsx` — the 10
  Dashboard hub-tile icons), replacing the emoji previously stored in
  `apps.ts`'s `icon` field. `AppMeta.icon` is now a component, rendered
  inside a span styled `color: var(--app-accent)` so each tile's icon
  automatically matches its app's brand color in both themes. First
  installment of a suite-wide emoji→SVG sweep the user asked for;
  purely functional emoji (Team Identity's symbol picker, Planning
  Poker's `☕` card, the Dashboard's own team-symbol pass-through chip)
  are explicitly out of scope and stay as emoji.

## 0.3.8 — Hide app-card descriptions in Facilitator Mode (2026-09-03)

- **fix (follow-up)**: `AppCard`'s description paragraph — explicitly
  flagged by the user as unnecessary while presenting — is now hidden
  when Facilitator Mode is active, kept as a `flex-1` spacer so card
  footers still line up across a grid row. `facilitatorMode` threaded
  down from `App.tsx`.

## 0.3.7 — Facilitator Mode (2026-09-03)

- **feat**: promoted Team Identity's Facilitator (projector) mode into a
  shared design-system pattern (`useFacilitatorMode.ts` +
  `FacilitatorToggle.tsx`) and adopted it here on the Dashboard itself —
  bigger UI via one `html.facilitator-mode { font-size: 1.25rem }` rule
  (everything sized in `rem` scales automatically), plus hiding secondary
  chrome (language picker, workspace manager, export/import panel, footer)
  while active. Toggled from a new header button next to the theme toggle,
  session-scoped via `sessionStorage('agile-toolkit:facilitatorMode')`.
  First of an 11-repo rollout — see `design-system/components.md`.
- **refactor**: promoted `AppHeader`'s `hideLanguagePicker` prop (previously
  a Team Identity-only local addition) into the canonical design-system
  source, and extended `check-drift.mjs` to track the two new files.

## 0.3.6 — Per-app accent card borders; theme-aware hero banner (2026-09-03)

- **fix (consistency)**: cards only got a colored top border when the app
  had usage data (`live`→orange, `active`→emerald); apps with no data yet
  fell back to a plain uniform gray border with no top-border override at
  all — a structurally different look, not just a different color, which
  read as "some cards are unfinished." Replaced with the suite's own
  per-app accent contract (`tokens.css` section 5,
  `data-accent="cobalt"/"pink"/"amber"/"violet"/"teal"/"coral"`, already
  used by every app's own root element): every card now gets a `data-accent`
  matching its actual sibling app and a `border-t-[color:var(--app-accent)]`
  top border, always present, light/dark-theme-aware for free via the
  existing token system. Live/active/attention status stays on the badge,
  which already existed independently — decoupling "which app is this"
  from "is there data" instead of conflating them into one signal.
  `AppMeta` gains an `accent` field (`src/apps.ts`).
- **fix (contrast)**: the hero banner's dark navy gradient
  (`#1a1a2e`/`#16213e`/`#0f3460`) was hardcoded regardless of theme — a
  jarring dark box on an otherwise light page in light theme. Added
  `--hero-gradient` (dashboard-only, `src/index.css`, not part of the
  shared `tokens.css` contract since no other app has a hero banner):
  a cobalt-brand gradient for light theme, the original navy gradient
  kept for dark (it already read fine there, matching the dark canvas
  the rest of the suite uses).

## 0.3.5 — Fix factually wrong app-card descriptions (2026-09-02)

- **fix**: `apps.ts`'s `sprint_metrics` card description claimed the app was
  "a Chrome extension for Jira" — it's a client-side web app with no Jira
  integration. `change_planner`'s claimed it was "based on the PDCA
  cycle" — it's based on Jurgen Appelo's 4-facet framework, per its own
  README. Both looked like two mismatched taglines stitched together;
  rewrote all 10 card descriptions in `apps.ts` to match each sibling
  app's actual README one-liner, and fixed the same two wrong strings in
  the (currently unused) `apps.*.desc` i18n keys across all 4 locales so
  they don't mislead a future reader either.
- **fix**: the "N tools" stat hardcoded `count: 10` instead of deriving it
  from `APPS.length` — correct today, but would silently go stale if an
  app is added or removed from the suite.
- **a11y**: wrapped `ExportImport.tsx`'s "Data Management" block in a
  `<section aria-label>` landmark — flagged by the 2026-09-01 visual
  audit as unlabeled/uncontained content (ROADMAP polish backlog).
- Found via a suite-wide UX/scope audit.

## 0.3.4 — Rework hero badge wording (2026-09-02)

- **content**: replaced the hero badge's placeholder "Agile Practice"
  text (a flat, generic stand-in from the previous Management 3.0
  removal pass) with "One Team, Ten Tools" — names the suite's actual
  differentiator (one shared team, ten connected apps) instead of a
  generic category label. All 4 locales.

## 0.3.3 — Remove Management 3.0 branding references (2026-09-02)

- **content**: removed explicit "Management 3.0" / "Jurgen Appelo" brand
  references and named-practice terminology ("CHAMPFROGS", "Identity
  Symbols", "Work Expo", "Improvement Dialogues", "Copilot Programs")
  from the page title, the hero badge, and every app card description in
  `src/apps.ts` and all 4 locale files — reworded to describe what each
  tool does generically rather than citing the specific framework or
  named practice it draws from. No functional change.

## 0.3.2 — Add test coverage for readers.ts (2026-09-02)

- **test**: `src/readers.ts` (the parser for every sibling app's
  localStorage summary, the Dashboard's core integration surface) had zero
  test coverage and no test runner configured at all. Added `vitest` +
  `jsdom`, and 36 tests across `src/readers.test.ts` (summary-key and
  fallback path for all 10 apps, plus branching edge cases) and
  `src/utils.test.ts` (`timeAgo`/`trunc`/`plural`). `npm test` now passes
  cleanly. Also fixed a `vite.config.ts` type error surfaced by adding the
  `test` config block — `tsc -b` typechecks `vite.config.ts` via
  `tsconfig.node.json` in this repo's project-references setup, so
  `defineConfig` needed to come from `vitest/config` (which merges in the
  `test` field's types) instead of plain `vite`.

## 0.3.1 (2026-09-01)

- fix: the "Import data" button's icon (`UploadIcon` in `ExportImport.tsx`)
  rendered as a broken, off-center shape instead of an up-arrow — its SVG
  path used relative `m`/`l` commands that didn't mirror `DownloadIcon`
  correctly and landed partly outside the 24×24 viewBox. Replaced with a
  path that mirrors `DownloadIcon`'s (correct) chevron-plus-stem geometry.

## 0.3.0 — E2: Shared team identity primitive (2026-09-01)

- docs: refresh `GOAL.md` from the suite-wide `GOALS.md` platform thesis
  (shared team object, revenue paths, per-app platform roles) and rebuild
  `ROADMAP.md` around it.
- feat: cross-app team identity contract — `agile-toolkit:activeTeam`
  (`src/team.ts`: `readActiveTeam()` / `writeActiveTeam(name, source)`).
  The Dashboard seeds it from Team Identity's `teamName` on every scan
  (Team Identity is the canonical "produces the team object" app per GOAL)
  and displays it via a new `TeamPill` in the nav bar, next to the wordmark
  — a team named once in Team Identity is now visible suite-wide instead of
  staying local to that app's own card. Contract + component copied into
  `design-system/` (`team.ts`, `components/TeamPill.tsx`, new catalog entry)
  so any other app can adopt reading it — or writing it instead of its own
  standalone team-name key — as its own future epic. i18n: `team.pill_label`
  in EN/ES/BE/RU.

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
