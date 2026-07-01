# Agile Toolkit Dashboard — Brief

## Overview

Central hub for the 10-app Agile Toolkit suite. Two roles: (1) displays a card per app with live data surfaced from each app's `localStorage`; (2) hosts the shared design system (tokens, component catalog, reusable source files) used across all apps.

## Features

- [x] App card grid — 10 cards with icon, title, description, live localStorage data preview, CTA link
- [x] Active/Live badge states on cards (emerald = data present, amber = session in progress)
- [x] Hero header with suite branding and in-use app count
- [x] `localStorage` readers for all 10 apps (`src/readers.ts`) — Moving Motivators reader updated to parse `moving-motivators:lastSession`; Team Identity reader updated to prefer `team-identity:lastSession` (with legacy fallback to `team-identity-charter`); Salary Formula reader prefers `salary-formula:lastSession` (profileCount · scenario name · salary range); Work Profiles reader prefers `work-profiles:lastSession` (profileCount · avg capacity% · top 2 skills)
- [x] Auto-refresh every 5 s + `storage` event listener
- [x] Design system: `tokens.css` — color, spacing, typography tokens
- [x] Design system: `AppCard`, `Badge`, `MemberAvatars`, `MiniBarChart`, `MiniKanban`, `ProgressBar`, `StatChipRow` components
- [x] Design system: `AppHeader` + `LanguagePicker` components (issue #3)
- [x] Design system: `ThemeToggle` component + light/dark theme tokens in `tokens.css`
- [x] Export / Import — v2 format with `_meta` envelope + `data` wrapper; prefix-based key ownership (no hardcoded list); import preview/confirm step; workspace-ready (`_meta.workspace` field; reads `agile-toolkit:activeWorkspace` when set)
- [x] Language switch — EN / ES / BE / RU via react-i18next; `LanguagePicker` in sticky nav; full UI translated including all 10 app titles and descriptions
- [x] Theme toggle — light / dark / system-default via `ThemeToggle` in sticky nav; anti-flash script in `index.html`; `dark:` variants on all components; `darkMode: 'class'` in Tailwind
- [x] Workspace management — `WorkspaceManager` component in stats row; workspace selector dropdown; Save current snapshots all owned keys; New workspace prompts for name; Manage modal with Load / Rename / Delete per workspace; `agile-toolkit:workspaces` + `agile-toolkit:activeWorkspace` localStorage keys; i18n in EN/ES/BE/RU
- [x] Sort by recency — active apps bubble to top of grid sorted by `timestamp` desc; inactive apps follow in suite order; "sorted by recent activity" hint text shown in stats bar when ≥1 app active; i18n in EN/ES/BE/RU
- [x] Change Planner dashboard card — richer reader: goal excerpt, facet coverage dots (4 colored dots for dance/mind/stimulate/change), open action count, overdue count; `AppData.facetCoverage?: boolean[]` field; `AppCard` renders dot row; `card.facets` i18n key in EN/ES/BE/RU
- [x] Planning Poker reader updated to prefer `planning-poker:lastSession` (sessionName · estimated/total stories · avgPoints; timestamp from date field); fallback to `planning-poker:history[0]`; final fallback to legacy `sprintMetrics_planningPoker` key (#21)
- [x] Improvement Board reader updated to prefer `improvement-board:lastSession` (total · active · member count; progress bar from done/total; timestamp from lastUpdated) with fallback to raw arrays (#22)
- [x] Team Identity reader detects `team-identity:draft` — when draft is newer than saved session, sets `live: true` and adds "step N/5 in progress" chip; amber Live badge shows (#23)

## Design System

Location: `design-system/`

| File | Purpose |
|------|---------|
| `tokens.css` | CSS custom properties for colors, spacing, radii, typography, light/dark theme tokens |
| `components.md` | Component catalog with usage, props, code snippets |
| `components/AppHeader.tsx` | Standard sticky header for all 10 apps |
| `components/LanguagePicker.tsx` | Flag+code dropdown language switcher |
| `components/ThemeToggle.tsx` | Sun/moon button; sets `class="dark"` on `<html>`, persists to `localStorage('theme')` |
| `components/AppCard.tsx` | Dashboard app card |
| `components/Badge.tsx` | Live/Active status pill |
| `components/MemberAvatars.tsx` | Team member initials circles |
| `components/MiniBarChart.tsx` | SVG spark-bar chart |
| `components/MiniKanban.tsx` | Miniature board preview |
| `components/ProgressBar.tsx` | Emerald completion bar |
| `components/StatChipRow.tsx` | Key-value chip row |

## Backlog

- [ ] [#3] Design System: AppHeader + LanguagePicker + ThemeToggle components — implemented, pending adoption by 10 apps
- [x] [#7] Feature: Update readers to prefer `salary-formula:lastSession` and `work-profiles:lastSession` summary keys — implemented
- [x] [#8] Integration: Sprint Metrics — `readSprintMetrics()` updated to prefer `sprint-metrics:lastSession` (projectName · last vel. · avg vel. · sprints left) with fallback to raw keys
- [x] [#9] UX: Sort Dashboard cards by recency — active apps bubble to top (implemented)
- [x] [#10] Feature: Multi-team / multi-project workspace management (snapshot + restore named workspaces) — implemented

## Backlog

- [x] [#21] Integration: Update Planning Poker Dashboard reader to prefer `planning-poker:lastSession` — implemented
- [x] [#22] Integration: Update Improvement Board Dashboard reader to prefer `improvement-board:lastSession` — implemented
- [x] [#23] UX: Show Team Identity draft-in-progress live indicator — implemented
- [x] [#24] Integration: Moving Motivators dashboard card — add session count chip from `moving-motivators:sessionHistory` (up to 20 sessions stored; show count when ≥2)
- [x] [#25] Integration: Scrum Facilitator dashboard card — add team name chip from `scrum-facilitator-team-name` (prepend as quoted name chip)
- [x] [#26] UX: Empty state onboarding hint when `activeCount === 0` — show "No data yet — open any app below to get started" below stats bar; i18n in EN/ES/BE/RU

## localStorage keys

Dashboard-internal keys (prefix `agile-toolkit:`) are never included in app exports — `claimedByApp()` returns null for them.

| Key | Shape | Set by |
|-----|-------|--------|
| `agile-toolkit:activeWorkspace` | `string` — active workspace name (default: "Default") | WorkspaceManager |
| `agile-toolkit:workspaces` | `Record<name, { savedAt: number, data: Record<key, rawString> }>` | WorkspaceManager |

## Tech notes

- react-i18next added; locales in `src/i18n/{en,es,be,ru}.json`; language persisted to `localStorage('i18nextLng')`. The `AppHeader` and `LanguagePicker` design system components are reference implementations for copying into the 10 apps; they are not compiled by this repo's `tsc` (only `src/` is in `tsconfig.app.json`).
- Readers in `src/readers.ts` consume well-known `localStorage` keys documented in each app's `BRIEF.md ## localStorage keys` section.

## Agent Log

### 2026-07-01 — feat: dashboard reader enhancements and empty-state hint (#24 #25 #26)
- Done: auto-approved issues #24, #25, #26 (8 days old, past 7-day threshold); updated `readMovingMotivators()` to also read `moving-motivators:sessionHistory` — adds session count chip when ≥2 sessions, uses `sessionHistory[0].savedAt` as timestamp fallback; updated `readScrumFacilitator()` to read `scrum-facilitator-team-name` (plain string via `localStorage.getItem`) — prepends quoted team name chip before ceremony/session chips; added `activeCount === 0` conditional in `App.tsx` rendering `stats.empty_hint` paragraph below stats bar; added `stats.empty_hint` i18n key in EN/ES/BE/RU; build passes
- Remaining: none
- Next task: check issues for human feedback; research cycle for next improvements

### 2026-06-28 — feat: dashboard reader updates for Planning Poker, Improvement Board, Team Identity (#21 #22 #23)
- Done: auto-approved issues #21, #22, #23 (all 8 days old, past 7-day threshold); updated `readPlanningPoker()` to prefer `planning-poker:lastSession` (sessionName chip, X/Y estimated, avgPoints, session count from history) with fallback to `planning-poker:history[0]` then legacy `sprintMetrics_planningPoker`; updated `readImprovementBoard()` to prefer `improvement-board:lastSession` (total/active/member count chips, progress bar, timestamp from lastUpdated) with fallback to raw arrays; updated `readTeamIdentity()` to read `team-identity:draft` — when draft is newer than saved session, sets `live: true` + "step N/5 in progress" chip; build passes
- Remaining: issues #24/#25/#26 reach 7-day auto-approve threshold 2026-06-30
- Next task: check issues for human feedback; auto-approve and implement #24 (Moving Motivators session count), #25 (Scrum Facilitator team name), #26 (empty state hint) on or after 2026-06-30

### 2026-06-26 — research: checked 6 open issues, none actionable yet
- Done: checked all 6 open issues (#21–#26) — all `needs-review` only; #21/#22/#23 are 6 days old (1 day short of 7-day auto-approve threshold), #24/#25/#26 are 3 days old; no `approved`, `incomplete`, `changes-requested`, or `research-more` labels; 6 issues already pending → no new research filed
- Remaining: none
- Next task: check issues for human feedback; #21/#22/#23 (Planning Poker reader, Improvement Board reader, Team Identity draft indicator) reach 7-day threshold on 2026-06-27 — auto-approve and implement first one then

### 2026-06-23 — research: Moving Motivators session count, Scrum Facilitator team name, empty state UX
- Done: audited readers.ts against all app localStorage contracts; found 3 gaps; created issues #24 (Moving Motivators session count from sessionHistory), #25 (Scrum Facilitator team name chip from scrum-facilitator-team-name key), #26 (empty state onboarding hint when activeCount=0); all added to project as Backlog; checked existing issues #21/#22/#23 — needs-review, 3 days old, not yet 7 days for auto-approve
- Remaining: none
- Next task: check issues for human feedback; implement first approved item among #21–#26

### 2026-06-20 — research: Planning Poker reader, Improvement Board reader, Team Identity draft indicator
- Done: checked open issues (none); surveyed readers.ts against apps' current localStorage contracts; found 3 integration gaps; created issues #21 (Planning Poker reader → planning-poker:lastSession), #22 (Improvement Board reader → improvement-board:lastSession), #23 (Team Identity draft live indicator); all added to project as Todo
- Remaining: none
- Next task: check issues for human feedback; implement #21/#22/#23 if approved

### 2026-06-16 — feat: Sprint Metrics dashboard card reads sprint-metrics:lastSession (#8)
- Done: updated `readSprintMetrics()` in `src/readers.ts` to prefer `sprint-metrics:lastSession` — shows projectName · lastVelocity last vel. · avgVelocity avg vel. · sprintsRemaining sprint left (if set); still reads `sprint-metrics-sprints` raw array for MiniBarChart velocities; fallback to old raw-key reader when summary key absent; closed issue #7 (already implemented); closed issue #8; build passes
- Remaining: none
- Next task: check issues for human feedback; research cycle for next improvements

### 2026-06-16 — feat: richer Change Planner dashboard card (change-planner#40)
- Done: extended `AppData` with `facetCoverage?: boolean[]`; updated `readChangePlanner()` to extract goal excerpt, 4-boolean facet coverage (dance/mind/stimulate/change), open action count, overdue count from `change-planner-initiatives`; added 4-dot facet coverage row to `AppCard` (blue=dance, purple=mind, emerald=stimulate, amber=change); `card.facets` i18n key in EN/ES/BE/RU; build passes
- Remaining: #8 (Sprint Metrics card) still pending sprint-metrics side
- Next task: check issues for human feedback; implement #8 (Sprint Metrics dashboard card) once sprint-metrics writes `sprint-metrics:lastSession` key

### 2026-06-13 — feat: sort Dashboard cards by recency (#9)
- Done: `App.tsx` splits `APPS` into active (data != null) and inactive buckets; active apps sorted by `timestamp` desc; `sortedApps` rendered instead of `APPS`; "sorted by recent activity" hint text appended to stats bar when `activeCount > 0`; `stats.sorted_hint` i18n key added to EN/ES/BE/RU
- Remaining: none for #9; #8 (sprint-metrics dashboard card) still pending sprint-metrics side
- Next task: check issues for human feedback; implement #8 (Sprint Metrics dashboard card) once sprint-metrics writes `sprint-metrics:lastSession` key

### 2026-06-09 — feat: richer Dashboard readers for salary-formula and work-profiles (#7)
- Done: updated `readSalaryFormula()` in `src/readers.ts` to prefer `salary-formula:lastSession` — shows profileCount · scenario name (truncated 18 chars) · salary range in k-notation (e.g. 45k–90k USD); fallback to raw arrays; updated `readWorkProfiles()` to prefer `work-profiles:lastSession` — shows profileCount · avg capacity% · top 2 skills joined with ·; fallback to raw arrays; closed issue #10 (already implemented); auto-approved #7 (Feature from BRIEF), #8 (integration, cross-repo), #9 (UX improvement, 10 days old); build passes
- Remaining: #8 needs sprint-metrics side (write summary key) before Dashboard reader can be updated; #9 (sort by recency) queued
- Next task: implement #9 (sort Dashboard cards by recency in App.tsx — split readAll() output into active/unused buckets, sort active by timestamp descending, render active first then unused, add "Sorted by recent activity" hint text when at least one app is active)

### 2026-06-06 — feat: workspace management (#10)
- Done: created `src/components/WorkspaceManager.tsx` — workspace selector dropdown + Save current button in stats row; Manage modal with Load / Rename / Delete per workspace; `agile-toolkit:workspaces` (snapshot store) + `agile-toolkit:activeWorkspace` (active name) localStorage keys; `isDashboardInternal()` helper + `DASHBOARD_KEY_PREFIXES` exported from `data-keys.ts`; i18n in EN/ES/BE/RU; build passes
- Remaining: none for #10
- Next task: check issues for human feedback

### 2026-06-06 — research: found approved issue #10 — pivoting to implementation
- Done: checked open issues; found #10 (Multi-team workspace management) with `approved` label
- Remaining: implement WorkspaceManager component — selector, save, new, load, delete, rename; localStorage keys agile-toolkit:workspaces and agile-toolkit:activeWorkspace
- Next task: implement #10 (WorkspaceManager in Dashboard — workspace selector dropdown in nav, save current, new workspace, manage drawer with load/delete/rename; agile-toolkit:workspaces stores {[name]: {[key]: value, savedAt}}; agile-toolkit:activeWorkspace stores active name; wire into App.tsx nav bar alongside ExportImport; update data-keys.ts to exclude workspace keys from app export sets)

### 2026-05-30 — feat: language switch + theme toggle
- Done: added react-i18next with EN/ES/BE/RU locales (`src/i18n/*.json`) — all UI strings translated including all 10 app titles and descriptions; added `LanguagePicker.tsx` and `ThemeToggle.tsx` (copied from design system, adapted for dashboard's slate color scheme); added sticky nav bar in `App.tsx` hosting both controls; updated `tailwind.config.js` (`darkMode: 'class'`), `index.html` (anti-flash script), `main.tsx` (i18n import); applied `dark:` variants to every component (AppCard, Badge, StatChipRow, ProgressBar, MiniKanban, MemberAvatars, ExportImport); `ProgressBar` and `AppCard` also use `t()` for translatable strings
- Next task: check issues for human feedback

### 2026-05-30 — feat: export/import v2 — prefix ownership, backup envelope, import preview
- Done: redesigned `data-keys.ts` — each app declares `keyPrefixes[]` and `legacyKeys[]`; `claimedByApp(key)` resolves ownership by prefix match first; `scanOwnedLocalStorage()` scans ALL localStorage by ownership (not a hardcoded list); added `src/backup.ts` — v2 envelope `{ _meta: { version, exportedAt, workspace, keyCount, appIds }, data: { ... } }`, `parseBackup()` reads both v1 (flat) and v2 formats; updated `ExportImport.tsx` — export uses scan, writes v2, filename includes workspace slug; import shows confirmation step (apps found, key count, workspace) before writing; skips unrecognised keys
- Next task: check issues for human feedback

### 2026-05-30 — feat: export/import + multi-team issues
- Done: added `src/data-keys.ts` (central registry of all 27 known localStorage keys across 10 apps, grouped by app); added `src/components/ExportImport.tsx` (Export downloads backup JSON; Import reads backup and restores known keys, dispatches storage event to refresh cards); wired into `App.tsx` between the grid and footer; created dashboard issue #10 (workspace management design); created multi-team issues in moving-motivators#34, team-identity#26, scrum-facilitator#24
- Next task: check issues for human feedback

### 2026-05-30 — research: reader improvements and UX opportunities
- Done: created issues #7 (update readers to prefer salary-formula:lastSession and work-profiles:lastSession summary keys — richer data, consistent pattern), #8 (Sprint Metrics: add sprint-metrics:lastSession summary key for velocity trend on Dashboard card — cross-repo task in sprint-metrics + Dashboard), #9 (UX: sort Dashboard cards by recency, active apps bubble to top using existing AppData.timestamp field)
- Waiting for human review on all three
- Next task: check issues for human feedback

### 2026-05-27 — feat: Moving Motivators and Team Identity dashboard card readers
- Done: added `readMovingMotivators()` reading `moving-motivators:lastSession` — shows top 3 motivators (capitalized, joined with ·) and change text chip; wired into `readAll()` replacing the previous `null`; updated `readTeamIdentity()` to prefer `team-identity:lastSession` (teamName, symbol, valuesCount, agreementsCount) with legacy fallback to `team-identity-charter` key
- Remaining features: none known
- Next task: check issues for human feedback; conduct research cycle (integration opportunities, UX improvements)

### 2026-05-20 — feat: AppHeader + LanguagePicker + ThemeToggle design system components (issue #3)
- Done: created `design-system/components/AppHeader.tsx` (white sticky h-14 header, grid icon → dashboard, brand-colored title, optional nav pills, children slot); created `design-system/components/LanguagePicker.tsx` (custom flag+code dropdown: 🇬🇧EN 🇪🇸ES 🇧🇾BE 🇷🇺RU, outside-click + keyboard nav); created `design-system/components/ThemeToggle.tsx` (sun/moon icon button, `class="dark"` on `<html>`, localStorage persistence, system preference detection); extended `design-system/tokens.css` with full `:root` light tokens + `.dark` block with 16 semantic theme variables; documented all three in `design-system/components.md` with props, token quick-reference table, anti-flash script, and tailwind.config.js change
- Header adoption issues: moving-motivators#24, scrum-facilitator#18, kanban-designer#16, salary-formula#21, team-identity#20, improvement-board#19, work-profiles#18, planning-poker#19, sprint-metrics#20, change-planner#31
- Theme adoption issues: moving-motivators#25, scrum-facilitator#19, kanban-designer#17, salary-formula#22, team-identity#21, improvement-board#20, work-profiles#19, planning-poker#20, sprint-metrics#21, change-planner#32
- Next task: check issues for human feedback; implement adoption issues as they are approved (header first, then theme per app)
